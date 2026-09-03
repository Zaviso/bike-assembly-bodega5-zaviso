import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getAppData, addLog, type BikeCatalogItem, type Worker } from '../../store';

export function BikeForm() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  
  const [selectedBike, setSelectedBike] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAppData().then(data => {
      setCatalog(data.catalog);
      setWorkers(data.workers);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBike || !selectedWorker || !date) return;
    
    await addLog({
      type: 'bike',
      workerId: selectedWorker,
      date,
      quantity,
      bikeId: selectedBike,
      description
    });
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/worker');
    }, 2000);
  };

  const bikeDetails = catalog.find(b => b.id === selectedBike);

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button type="button" className="secondary flex-center" onClick={() => navigate('/worker')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Bicicletas</h2>
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
            <label>Tu Nombre (Armador)</label>
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

          <div className="mb-2">
            <label>Bicicleta</label>
            <select value={selectedBike} onChange={(e) => setSelectedBike(e.target.value)} required>
              <option value="">Selecciona la bicicleta</option>
              {catalog.map(b => (
                <option key={b.id} value={b.id}>{b.code} - {b.description.substring(0, 30)}...</option>
              ))}
            </select>
          </div>

          {bikeDetails && (
            <div className="mb-2" style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {bikeDetails.image && (
                <img src={bikeDetails.image} alt={bikeDetails.code} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
              <div>
                <strong>{bikeDetails.code}</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{bikeDetails.description}</p>
              </div>
            </div>
          )}

          <div className="mb-2">
            <label>Cantidad Armada</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </div>

          <div className="mb-4">
            <label>Descripción / Observación (Opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detalles extra..."></textarea>
          </div>

          <button type="submit" className="primary" style={{ width: '100%', padding: '1rem' }}>
            REGISTRAR ARMADO
          </button>
        </form>
      )}
    </div>
  );
}
