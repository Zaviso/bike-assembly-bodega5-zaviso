import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Upload, Edit2 } from 'lucide-react';
import { getAppData, addBikeToCatalog, removeBikeFromCatalog, updateBikeInCatalog, type BikeCatalogItem } from '../../store';
import Swal from 'sweetalert2';

export function CatalogManager() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [receivedQuantity, setReceivedQuantity] = useState<number | ''>('');
  
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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImage(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = async (bike: BikeCatalogItem) => {
    const { value: pin } = await Swal.fire({
      title: 'Acceso Restringido',
      input: 'password',
      inputLabel: 'Introduce el PIN para editar',
      inputPlaceholder: 'PIN',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
    });
    
    if (pin === 'E.Labra5') {
      setEditingId(bike.id);
      setCode(bike.code);
      setDescription(bike.description);
      setImage(bike.image || '');
      setReceivedQuantity(bike.receivedQuantity || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pin) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'PIN incorrecto',
        confirmButtonColor: '#f97316',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCode('');
    setDescription('');
    setImage('');
    setReceivedQuantity('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !description) return;
    const parsedQuantity = receivedQuantity === '' ? 0 : Number(receivedQuantity);
    
    if (editingId) {
      await updateBikeInCatalog(editingId, { code, description, image, receivedQuantity: parsedQuantity });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Bicicleta actualizada',
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      await addBikeToCatalog({ code, description, image, receivedQuantity: parsedQuantity });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Bicicleta agregada',
        showConfirmButton: false,
        timer: 1500
      });
    }
    
    handleCancelEdit();
    loadCatalog();
  };

  const handleRemove = async (id: string) => {
    const { value: pin } = await Swal.fire({
      title: 'Acceso Restringido',
      input: 'password',
      inputLabel: 'Introduce el PIN para eliminar',
      inputPlaceholder: 'PIN',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });

    if (pin === 'E.Labra5') {
      const result = await Swal.fire({
        title: '¿Eliminar bicicleta?',
        text: '¿Seguro que deseas eliminar esta bicicleta del catálogo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#475569',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await removeBikeFromCatalog(id);
        loadCatalog();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Bicicleta eliminada',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } else if (pin) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'PIN incorrecto',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Catálogo</h2>
      </div>

      <form onSubmit={handleSubmit} className="card mb-4">
        <h3>{editingId ? 'Editar Bicicleta' : 'Agregar Nueva Bicicleta'}</h3>
        <div className="mt-2 mb-2">
          <label>Código</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Ej: BIC-29-PRO" required />
        </div>
        <div className="mb-2">
          <label>Descripción</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mountain Bike Aro 29..." required />
        </div>
        <div className="mb-2">
          <label>Cantidad Recibida (Inventario Inicial)</label>
          <input type="number" min="0" value={receivedQuantity} onChange={e => setReceivedQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Ej: 150" />
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          {editingId && (
            <button type="button" className="secondary" onClick={handleCancelEdit} style={{ flex: 1 }}>
              Cancelar
            </button>
          )}
          <button type="submit" className="primary" style={{ flex: editingId ? 1 : 'none', width: editingId ? 'auto' : '100%' }}>
            {editingId ? 'Guardar Cambios' : 'Guardar Bicicleta'}
          </button>
        </div>
      </form>

      <h3>Bicicletas Registradas</h3>
      <div className="grid mt-2">
        {catalog.map(bike => (
          <div key={bike.id} className="card flex-between" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {bike.image ? (
                <img src={bike.image} alt={bike.code} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', flexShrink: 0 }} />
              )}
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{bike.code}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{bike.description}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="secondary" 
                style={{ padding: '0.5rem' }} 
                onClick={() => handleEditClick(bike)}
                title="Editar"
              >
                <Edit2 size={20} />
              </button>
              <button 
                className="secondary" 
                style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} 
                onClick={() => handleRemove(bike.id)}
                title="Eliminar"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
