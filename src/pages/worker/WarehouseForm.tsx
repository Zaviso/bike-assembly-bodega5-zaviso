import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getAppData, addLog, type Worker } from '../../store';

export function WarehouseForm() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  
  const [selectedWorker, setSelectedWorker] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [description, setDescription] = useState('');
  
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAppData().then(data => {
      setWorkers(data.workers);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !date || !startTime || !endTime || !warehouseName) return;
    
    await addLog({
      type: 'warehouse',
      workerId: selectedWorker,
      date,
      startTime,
      endTime,
      warehouseName,
      description
    });
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/worker');
    }, 2000);
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button type="button" className="secondary flex-center" onClick={() => navigate('/worker')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Bodega</h2>
      </div>

      {success ? (
        <div className="card flex-center animate-fade-in" style={{ flexDirection: 'column', padding: '4rem 2rem', textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)' }} className="mb-2" />
          <h2>¡Guardado Exitosamente!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Redirigiendo al panel...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <div className="mb-2">
            <label>Tu Nombre</label>
            <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} required>
              <option value="">Selecciona tu nombre</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 mb-2">
            <div>
              <label>Hora Inicio</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label>Hora Fin</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          <div className="mb-2">
            <label>Nombre de Bodega / Lugar</label>
            <input type="text" value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} placeholder="EJEMPLO: CDM" required />
          </div>

          <div className="mb-4">
            <label>¿Qué estuviste haciendo? (Tareas)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Mover cajas, ordenar stock..." required></textarea>
          </div>

          <button type="submit" className="primary" style={{ width: '100%', padding: '1rem' }}>
            REGISTRAR AYUDA
          </button>
        </form>
      )}
    </div>
  );
}
