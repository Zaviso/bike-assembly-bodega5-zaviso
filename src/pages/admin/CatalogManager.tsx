import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { getAppData, addBikeToCatalog, removeBikeFromCatalog, type BikeCatalogItem } from '../../store';

export function CatalogManager() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = () => {
    getAppData().then(data => setCatalog(data.catalog));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !description) return;
    
    await addBikeToCatalog({ code, description, image });
    setCode('');
    setDescription('');
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadCatalog();
  };

  const handleRemove = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta bicicleta?')) {
      await removeBikeFromCatalog(id);
      loadCatalog();
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Catálogo</h2>
      </div>

      <form onSubmit={handleAdd} className="card mb-4">
        <h3>Agregar Nueva Bicicleta</h3>
        <div className="mt-2 mb-2">
          <label>Código</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Ej: BIC-29-PRO" required />
        </div>
        <div className="mb-2">
          <label>Descripción</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mountain Bike Aro 29..." required />
        </div>
        <div className="mb-4">
          <label>Imagen</label>
          <div className="flex-center" style={{ gap: '1rem', justifyContent: 'flex-start' }}>
            <button type="button" className="secondary flex-center" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} style={{ marginRight: '8px' }} />
              Subir Foto
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
            {image && <img src={image} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />}
          </div>
        </div>
        <button type="submit" className="primary" style={{ width: '100%' }}>Guardar Bicicleta</button>
      </form>

      <h3>Bicicletas Registradas</h3>
      <div className="grid mt-2">
        {catalog.map(bike => (
          <div key={bike.id} className="card flex-between" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {bike.image ? (
                <img src={bike.image} alt={bike.code} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px' }} />
              )}
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{bike.code}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{bike.description}</p>
              </div>
            </div>
            <button className="secondary" style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleRemove(bike.id)}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
