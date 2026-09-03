import { useNavigate } from 'react-router-dom';
import { Bike, Sofa, Warehouse, ArrowLeft, FileText } from 'lucide-react';

export function WorkerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Volver
        </button>
        <h2 className="text-accent">Panel de Armador</h2>
      </div>

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
          <h3>Chambas fuera de la 5</h3>
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
