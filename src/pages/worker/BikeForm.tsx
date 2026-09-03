import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAppData, addLog, removeLastBikeLog, type BikeCatalogItem, type Worker, type LogEntry } from '../../store';
import Swal from 'sweetalert2';

export function BikeForm() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Try to load last selected worker from localStorage
  const [selectedWorker, setSelectedWorker] = useState(localStorage.getItem('lastSelectedWorker') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    getAppData().then(data => {
      setCatalog(data.catalog);
      setWorkers(data.workers);
      setLogs(data.logs);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWorker(val);
    localStorage.setItem('lastSelectedWorker', val);
  };

  const handleAdd = async (bikeId: string) => {
    if (!selectedWorker) {
      Swal.fire({ icon: 'warning', title: 'Falta Armador', text: 'Selecciona tu nombre arriba primero.', confirmButtonColor: '#ff7043' });
      return;
    }
    
    // Add log
    await addLog({
      type: 'bike',
      workerId: selectedWorker,
      date,
      quantity: 1,
      bikeId
    });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '+1 Bici Registrada',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    // Refresh logs to update counts
    loadData();
  };

  const handleRemove = async (bikeId: string) => {
    if (!selectedWorker) return;
    
    const count = getCountForBike(bikeId);
    if (count <= 0) return;

    await removeLastBikeLog(selectedWorker, date, bikeId);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: '-1 Bici Eliminada',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    loadData();
  };

  const getCountForBike = (bikeId: string) => {
    return logs
      .filter(l => l.type === 'bike' && l.workerId === selectedWorker && l.date === date && l.bikeId === bikeId)
      .reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="flex-between mb-4">
        <button type="button" className="secondary flex-center" onClick={() => navigate('/worker')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Conteo de Bicicletas</h2>
      </div>

      <div className="card mb-4" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="mb-2">
          <label>Tu Nombre (Armador)</label>
          <select value={selectedWorker} onChange={handleWorkerChange} required style={{ borderColor: selectedWorker ? 'var(--accent-orange)' : 'var(--error)' }}>
            <option value="">-- Selecciona tu nombre --</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Fecha de Trabajo</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      {selectedWorker ? (
        <div className="grid">
          {catalog.map(bike => {
            const count = getCountForBike(bike.id);
            return (
              <div key={bike.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  {bike.image ? (
                    <img src={bike.image} alt={bike.code} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px' }}></div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{bike.code}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{bike.description}</p>
                  </div>
                </div>

                <div className="flex-between" style={{ alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '0 10px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Hoy llevas</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: count > 0 ? 'var(--accent-orange)' : 'var(--text-primary)' }}>{count}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleRemove(bike.id)}
                      disabled={count === 0}
                      style={{ 
                        backgroundColor: count > 0 ? '#d32f2f' : '#444', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: count > 0 ? 'pointer' : 'not-allowed',
                        opacity: count > 0 ? 1 : 0.5
                      }}
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => handleAdd(bike.id)}
                      style={{ 
                        backgroundColor: '#388e3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.5rem 1.5rem', 
                        borderRadius: '4px', 
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          ↑ Selecciona tu nombre arriba para empezar a registrar.
        </div>
      )}
    </div>
  );
}
