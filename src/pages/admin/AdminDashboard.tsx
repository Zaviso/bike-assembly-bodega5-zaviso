import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bike, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { getAppData, type LogEntry, type BikeCatalogItem } from '../../store';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    setIsRefreshing(true);
    getAppData().then(data => {
      setLogs(data.logs);
      setCatalog(data.catalog);
      setTimeout(() => setIsRefreshing(false), 500); // Pequeño delay visual
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const bikeLogs = logs.filter(l => l.type === 'bike');
  const bikeCountsByCode = bikeLogs.reduce((acc, curr) => {
    const bike = catalog.find(b => b.id === curr.bikeId);
    const code = bike ? bike.code : 'Desconocido';
    acc[code] = (acc[code] || 0) + (curr.quantity || 1);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="app-container animate-fade-in">
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
        <h3>Bicicletas Armadas por Código</h3>
      </div>
      <div className="grid grid-cols-2 mb-4">
        {Object.entries(bikeCountsByCode).length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>No hay registros aún.</p>
        ) : (
          Object.entries(bikeCountsByCode)
            .sort(([codeA], [codeB]) => codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' }))
            .map(([code, count]) => (
            <div key={code} className="card" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{code}</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{count}</p>
            </div>
          ))
        )}
      </div>

      <h3 className="mb-2">Gestión y Reportes</h3>
      <div className="grid">
        <div className="card interactive flex-between" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/catalog')}>
          <div className="flex-center">
            <Bike className="text-accent" style={{ marginRight: '1rem' }} />
            <span>Catálogo de Bicicletas</span>
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
