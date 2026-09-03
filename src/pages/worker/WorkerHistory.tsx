import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getAppData, type BikeCatalogItem, type Worker, type LogEntry } from '../../store';

export function WorkerHistory() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [selectedWorker, setSelectedWorker] = useState(localStorage.getItem('lastSelectedWorker') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    getAppData().then(data => {
      setCatalog(data.catalog);
      setWorkers(data.workers);
      setLogs(data.logs);
    });
  }, []);

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWorker(val);
    localStorage.setItem('lastSelectedWorker', val);
  };

  // Filtrar logs
  const myLogs = logs.filter(l => l.type === 'bike' && l.workerId === selectedWorker && l.date === date);
  
  // Agrupar por bicicleta
  const bikeCounts = myLogs.reduce((acc, curr) => {
    const bike = catalog.find(b => b.id === curr.bikeId);
    const code = bike ? bike.code : 'Desconocido';
    acc[code] = (acc[code] || 0) + (curr.quantity || 1);
    return acc;
  }, {} as Record<string, number>);

  const totalBikes = Object.values(bikeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button type="button" className="secondary flex-center" onClick={() => navigate('/worker')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Mi Historial</h2>
      </div>

      <div className="card mb-4" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="mb-2">
          <label>Tu Nombre (Armador)</label>
          <select value={selectedWorker} onChange={handleWorkerChange} required>
            <option value="">-- Selecciona tu nombre --</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Fecha del Historial</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      {!selectedWorker ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          Selecciona tu nombre para ver tu historial.
        </div>
      ) : (
        <div className="card">
          <div className="flex-between mb-4" style={{ borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} className="text-accent" />
              Resumen del Día
            </h3>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Armadas</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--accent-orange)' }}>{totalBikes}</p>
            </div>
          </div>

          {Object.entries(bikeCounts).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
              No hay bicicletas registradas en esta fecha.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(bikeCounts)
                .sort(([codeA], [codeB]) => codeA.localeCompare(codeB, undefined, { numeric: true }))
                .map(([code, count]) => (
                <div key={code} className="flex-between" style={{ backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '4px' }}>
                  <span style={{ fontWeight: '500' }}>{code}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{count} u.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
