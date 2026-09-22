import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Sofa, Warehouse, ArrowLeft, FileText } from 'lucide-react';
import { getAppData, type LogEntry, type BikeCatalogItem } from '../../store';

export function WorkerDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const selectedWorker = localStorage.getItem('lastSelectedWorker') || '';
  
  useEffect(() => {
    if (selectedWorker) {
      getAppData().then(data => {
        setLogs(data.logs);
        setCatalog(data.catalog);
      });
    }
  }, [selectedWorker]);

  const today = new Date().toISOString().split('T')[0];
  const myTodayBikeLogs = logs.filter(l => l.type === 'bike' && l.workerId === selectedWorker && l.date === today);
  
  const todayCountsByCode = myTodayBikeLogs.reduce((acc, curr) => {
    const bike = catalog.find(b => b.id === curr.bikeId);
    const code = bike ? bike.code : 'Desconocido';
    acc[code] = (acc[code] || 0) + (curr.quantity || 1);
    return acc;
  }, {} as Record<string, number>);

  const totalToday = Object.values(todayCountsByCode).reduce((a, b) => a + b, 0);

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Volver
        </button>
        <h2 className="text-accent">Panel de Armador</h2>
      </div>

      {selectedWorker && (
        <div className="card mb-4" style={{ borderLeft: '4px solid var(--accent-yellow)', backgroundColor: 'var(--bg-card)' }}>
          <div className="flex-between mb-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--accent-yellow)' }}>Mi Avance de Hoy</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalToday} bicis</span>
          </div>
          
          {Object.keys(todayCountsByCode).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Aún no has armado bicicletas hoy.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              {Object.entries(todayCountsByCode)
                .sort(([codeA], [codeB]) => codeA.localeCompare(codeB, undefined, { numeric: true }))
                .map(([code, count]) => (
                <div key={code} className="flex-between" style={{ backgroundColor: 'var(--bg-dark)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{code}</span>
                  <strong style={{ fontSize: '1rem' }}>{count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedWorker && (
        <div className="card mb-4" style={{ textAlign: 'center', color: 'var(--accent-orange)' }}>
          ⚠️ Por favor, ve a "Mi Historial" para seleccionar tu nombre y poder ver tu avance diario.
        </div>
      )}

      <div className="grid">
        <div className="card interactive flex-center" style={{ flexDirection: 'column', padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/worker/bike')}>
          <Bike size={48} className="text-accent mb-2" />
          <h3>Armado de Bicicletas</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Seleccionar bicicleta del catálogo</p>
        </div>

        <div className="card interactive flex-center" style={{ flexDirection: 'column', padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/worker/furniture')}>
          <Sofa size={48} className="text-accent mb-2" />
          <h3>Armado de Muebles</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Ingresar código manualmente</p>
        </div>

        <div className="card interactive flex-center" style={{ flexDirection: 'column', padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/worker/warehouse')}>
          <Warehouse size={48} className="text-accent mb-2" />
          <h3>Chambas aparte</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Registrar horas y tareas</p>
        </div>
        
        <div className="card interactive flex-center" style={{ flexDirection: 'column', padding: '2rem', cursor: 'pointer' }} onClick={() => navigate('/worker/history')}>
          <FileText size={48} className="text-accent mb-2" />
          <h3>Mi Historial</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Ver trabajos realizados</p>
        </div>
      </div>
    </div>
  );
}
