import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { BikeForm } from './pages/worker/BikeForm';
import { FurnitureForm } from './pages/worker/FurnitureForm';
import { WarehouseForm } from './pages/worker/WarehouseForm';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CatalogManager } from './pages/admin/CatalogManager';
import { TeamManager } from './pages/admin/TeamManager';
import { LogsViewer } from './pages/admin/LogsViewer';
import { Wrench, Settings } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="app-container flex-center animate-fade-in" style={{ height: '100vh', flexDirection: 'column' }}>
      <h1 className="mb-4 text-accent" style={{ fontSize: '2.5rem', textAlign: 'center' }}>
        TRACKER DE ARMADO
      </h1>
      
      <div className="grid grid-cols-2" style={{ gap: '2rem', width: '100%', maxWidth: '600px' }}>
        <div 
          className="card interactive flex-center" 
          style={{ flexDirection: 'column', cursor: 'pointer', padding: '3rem 1rem' }}
          onClick={() => navigate('/worker')}
        >
          <Wrench size={48} className="text-accent mb-2" />
          <h2>Soy Armador</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
            Registrar producción y ayuda en bodegas
          </p>
        </div>

        <div 
          className="card interactive flex-center" 
          style={{ flexDirection: 'column', cursor: 'pointer', padding: '3rem 1rem' }}
          onClick={() => navigate('/admin')}
        >
          <Settings size={48} className="text-accent mb-2" />
          <h2>Administrador</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
            Dashboard, gestión y reportes
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', color: 'var(--text-secondary)', opacity: 0.7, fontSize: '0.8rem', zIndex: 1000, pointerEvents: 'none' }}>
        Hecho por Saviso
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Worker Routes */}
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/worker/bike" element={<BikeForm />} />
        <Route path="/worker/furniture" element={<FurnitureForm />} />
        <Route path="/worker/warehouse" element={<WarehouseForm />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/catalog" element={<CatalogManager />} />
        <Route path="/admin/team" element={<TeamManager />} />
        <Route path="/admin/logs" element={<LogsViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
