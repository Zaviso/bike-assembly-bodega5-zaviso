import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, UserPlus } from 'lucide-react';
import { getAppData, addWorker, removeWorker, type Worker } from '../../store';

export function TeamManager() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = () => {
    getAppData().then(data => setWorkers(data.workers));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await addWorker(name);
    setName('');
    loadWorkers();
  };

  const handleRemove = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar a este armador?')) {
      await removeWorker(id);
      loadWorkers();
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Equipo</h2>
      </div>

      <form onSubmit={handleAdd} className="card mb-4 flex-center" style={{ gap: '1rem', flexDirection: 'column', alignItems: 'stretch' }}>
        <h3 className="mb-1">Agregar Armador</h3>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del trabajador..." required />
        <button type="submit" className="primary flex-center">
          <UserPlus size={18} style={{ marginRight: '8px' }} />
          Agregar
        </button>
      </form>

      <h3>Lista de Armadores</h3>
      <div className="grid mt-2">
        {workers.map(worker => (
          <div key={worker.id} className="card flex-between" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{worker.name}</span>
            <button className="secondary" style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleRemove(worker.id)}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
