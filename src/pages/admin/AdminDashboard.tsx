import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bike, FileText, ArrowLeft, RefreshCw, ChevronDown, ChevronRight, Printer } from 'lucide-react';
import { getAppData, type LogEntry, type BikeCatalogItem, type Worker } from '../../store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDailyExpanded, setIsDailyExpanded] = useState(false);

  const loadData = () => {
    setIsRefreshing(true);
    getAppData().then(data => {
      setLogs(data.logs);
      setCatalog(data.catalog);
      setWorkers(data.workers);
      setTimeout(() => setIsRefreshing(false), 500); // Pequeño delay visual
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Lógica del Dashboard Diario ---
  const bikeLogs = logs.filter(l => l.type === 'bike' && l.date === selectedDate);
  const dailyWorkerLogs: Record<string, Record<string, number>> = {};
  let totalDailyBikes = 0;

  bikeLogs.forEach(log => {
    const bike = catalog.find(b => b.id === log.bikeId);
    const code = bike ? bike.code : 'Desconocido';
    const workerName = workers.find(w => w.id === log.workerId)?.name || 'Desconocido';
    const qty = log.quantity || 1;

    if (!dailyWorkerLogs[workerName]) dailyWorkerLogs[workerName] = {};
    dailyWorkerLogs[workerName][code] = (dailyWorkerLogs[workerName][code] || 0) + qty;
    totalDailyBikes += qty;
  });

  // --- Lógica de Inventario Total ---
  const allBikeLogs = logs.filter(l => l.type === 'bike');
  const allTimeBikeCounts = allBikeLogs.reduce((acc, curr) => {
    const bike = catalog.find(b => b.id === curr.bikeId);
    const code = bike ? bike.code : 'Desconocido';
    acc[code] = (acc[code] || 0) + (curr.quantity || 1);
    return acc;
  }, {} as Record<string, number>);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Inventario Físico (Bicicletas)', 14, 20);
    
    const tableData = catalog.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map(bike => {
      const received = bike.receivedQuantity || 0;
      const damaged = bike.damagedQuantity || 0;
      const assembled = allTimeBikeCounts[bike.code] || 0;
      const remaining = received - assembled - damaged;
      return [bike.code, received, assembled, damaged, remaining];
    });

    autoTable(doc, {
      startY: 30,
      head: [['Código', 'Recibidas (Cajas)', 'Armadas Totales', 'Serv. Tec.', 'Físico Esperado']],
      body: tableData,
    });

    doc.save('inventario-fisico.pdf');
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Volver
        </button>
        <button 
          className="secondary flex-center" 
          onClick={loadData}
          disabled={isRefreshing}
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title="Actualizar Datos"
        >
          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      <div className="flex-between mb-2">
        <h3 style={{ margin: 0 }}>Dashboard Diario</h3>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
        />
      </div>

      {/* Tarjeta Expandible del Dashboard Diario */}
      <div className="mb-4">
        <div 
          className="card interactive flex-between" 
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--accent-orange)' }}
          onClick={() => setIsDailyExpanded(!isDailyExpanded)}
        >
          <div>
            <h4 style={{ color: 'var(--accent-orange)', fontSize: '1.2rem', fontWeight: 'bold' }}>Total Armadas</h4>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{totalDailyBikes}</p>
          </div>
          <div>
            {isDailyExpanded ? <ChevronDown size={28} className="text-accent" /> : <ChevronRight size={28} className="text-accent" />}
          </div>
        </div>

        {isDailyExpanded && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.keys(dailyWorkerLogs).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No hay registros para este día.</p>
            ) : (
              Object.entries(dailyWorkerLogs)
                .sort(([workerA], [workerB]) => workerA.localeCompare(workerB))
                .map(([workerName, codes]) => {
                  const workerTotal = Object.values(codes).reduce((a, b) => a + b, 0);
                  return (
                    <div key={workerName} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-card)' }}>
                      <div className="flex-between mb-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{workerName}</strong>
                        <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>{workerTotal} total</span>
                      </div>
                      {Object.entries(codes)
                        .sort(([codeA], [codeB]) => codeA.localeCompare(codeB, undefined, { numeric: true }))
                        .map(([code, count]) => (
                          <div key={code} className="flex-between" style={{ padding: '4px 0' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{code}</span>
                            <strong>{count} u.</strong>
                          </div>
                      ))}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

      <div className="flex-between mb-2 mt-4">
        <h3 style={{ margin: 0 }}>Inventario Físico (Bicicletas)</h3>
        <button className="secondary flex-center" onClick={generatePDF} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          <Printer size={16} style={{ marginRight: '6px' }} />
          Imprimir PDF
        </button>
      </div>
      <div className="mb-4" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-card)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Código</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Recibidas (Cajas)</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Armadas Totales</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--danger)' }}>Serv. Téc.</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Físico Esperado</th>
            </tr>
          </thead>
          <tbody>
            {catalog.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map(bike => {
              const received = bike.receivedQuantity || 0;
              const damaged = bike.damagedQuantity || 0;
              const assembled = allTimeBikeCounts[bike.code] || 0;
              const remaining = received - assembled - damaged;
              
              return (
                <tr key={bike.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{bike.code}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{received}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{assembled}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: 'var(--danger)' }}>{damaged}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: remaining < 0 ? 'var(--danger)' : remaining === 0 ? 'var(--text-secondary)' : 'var(--success)'
                    }}>
                      {remaining}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {catalog.length === 0 && (
          <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>El catálogo está vacío.</p>
        )}
      </div>

      <h3 className="mb-2 mt-4">Gestión y Reportes</h3>
      <div className="grid">
        <div className="card interactive flex-between" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/catalog')}>
          <div className="flex-center">
            <Bike className="text-accent" style={{ marginRight: '1rem' }} />
            <span>Catálogo de Bicicletas e Inventario</span>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>➔</span>
        </div>

        <div className="card interactive flex-between" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/team')}>
          <div className="flex-center">
            <Users className="text-accent" style={{ marginRight: '1rem' }} />
            <span>Gestión del Equipo</span>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>➔</span>
        </div>

        <div className="card interactive flex-between" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/logs')}>
          <div className="flex-center">
            <FileText className="text-accent" style={{ marginRight: '1rem' }} />
            <span>Ver Registros y Exportar</span>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>➔</span>
        </div>
      </div>
    </div>
  );
}
