import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { BikeForm } from './pages/worker/BikeForm';
import { FurnitureForm } from './pages/worker/FurnitureForm';
import { WarehouseForm } from './pages/worker/WarehouseForm';
import { WorkerHistory } from './pages/worker/WorkerHistory';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CatalogManager } from './pages/admin/CatalogManager';
import { TeamManager } from './pages/admin/TeamManager';
import { LogsViewer } from './pages/admin/LogsViewer';
import { Wrench, Settings, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="app-container flex-center animate-fade-in" style={{ height: '100vh', flexDirection: 'column' }}>
      <h1 className="mb-4 text-accent" style={{ fontSize: '2.5rem', textAlign: 'center', lineHeight: '1.2' }}>
        <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>BODEGA 5</span><br/>
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
          onClick={async () => {
            const { value: pin } = await Swal.fire({
              title: 'Acceso Restringido',
              input: 'password',
              inputLabel: 'Introduce el PIN de administrador',
              inputPlaceholder: 'PIN',
              showCancelButton: true,
              confirmButtonText: 'Entrar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#ff7043',
            });
            
            if (pin) {
              if (pin.trim() === 'E.Labra5') {
                navigate('/admin');
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Acceso denegado',
                  text: 'PIN incorrecto',
                  confirmButtonColor: '#ff7043',
                });
              }
            }
          }}
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

function GlobalLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().toUpperCase() === 'BODEGA5') {
      localStorage.setItem('app_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="app-container flex-center animate-fade-in" style={{ height: '100vh', flexDirection: 'column' }}>
      <Lock size={64} className="text-accent mb-4" />
      <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>Acceso Privado</h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', maxWidth: '400px' }}>
        Esta aplicación es de uso exclusivo para el equipo de Bodega 5. Ingresa la clave de acceso para continuar.
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }} className="flex-center flex-col">
        <input 
          type="password" 
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          placeholder="Clave de acceso"
          style={{ width: '100%', marginBottom: '1rem', textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem', padding: '0.8rem' }}
        />
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>Clave incorrecta</p>}
        <button type="submit" className="primary" style={{ width: '100%' }}>Desbloquear</button>
      </form>
    </div>
  );
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unlocked = localStorage.getItem('app_unlocked') === 'true';
    setIsUnlocked(unlocked);
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  if (!isUnlocked) {
    return <GlobalLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

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
        <Route path="/worker/history" element={<WorkerHistory />} />
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
