import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, ChevronDown, ChevronRight, Folder, Trash2, Edit2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAppData, type LogEntry, type Worker, type BikeCatalogItem, removeLog, updateLog } from '../../store';
import Swal from 'sweetalert2';

export function LogsViewer() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);

  // Accordion states
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAppData().then(data => {
      // Sort logs descending (newest first)
      setLogs(data.logs.sort((a, b) => b.timestamp - a.timestamp));
      setWorkers(data.workers);
      setCatalog(data.catalog);
    });
  }, []);

  const getWorkerName = (id: string) => workers.find(w => w.id === id)?.name || 'Desconocido';
  const getBikeCode = (id: string) => catalog.find(b => b.id === id)?.code || 'Bici Eliminada';

  const toggleYear = (year: string) => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  const toggleMonth = (monthKey: string) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));

  const handleRemoveLog = async (id: string) => {
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
        title: '¿Eliminar registro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#444',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await removeLog(id);
        setLogs(prevLogs => prevLogs.filter(l => l.id !== id));
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Registro eliminado',
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

  const handleEditLog = async (log: LogEntry) => {
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
      if (log.type === 'bike' || log.type === 'furniture') {
        const { value: newQuantity } = await Swal.fire({
          title: 'Editar Cantidad',
          input: 'number',
          inputValue: log.quantity?.toString(),
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          cancelButtonText: 'Cancelar'
        });

        if (newQuantity && !isNaN(Number(newQuantity)) && Number(newQuantity) > 0) {
          await updateLog(log.id, { quantity: Number(newQuantity) });
          setLogs(prev => prev.map(l => l.id === log.id ? { ...l, quantity: Number(newQuantity) } : l));
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Registro actualizado',
            showConfirmButton: false,
            timer: 1500
          });
        }
      } else {
        Swal.fire('Edición no disponible', 'Por el momento solo se puede editar la cantidad de bicis o muebles.', 'info');
      }
    } else if (pin) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'PIN incorrecto',
        confirmButtonColor: '#f97316',
      });
    }
  };

  // Agrupar logs para la vista de carpetas (Año -> Mes -> Logs[])
  const grouped: Record<string, Record<string, LogEntry[]>> = {};
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  logs.forEach(log => {
    const [year, monthNum] = log.date.split('-');
    const monthName = monthNames[parseInt(monthNum) - 1];

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][monthName]) grouped[year][monthName] = [];
    
    grouped[year][monthName].push(log);
  });

  const exportToExcel = () => {
    const dataToExport = logs.map(log => ({
      Fecha: log.date,
      Armador: getWorkerName(log.workerId),
      Tipo: log.type === 'bike' ? 'Bicicleta' : log.type === 'furniture' ? 'Mueble' : 'Apoyos fuera de la bodega 5',
      'Código Bici/Mueble': log.type === 'bike' ? getBikeCode(log.bikeId!) : log.type === 'furniture' ? log.furnitureCode : '-',
      Cantidad: log.quantity || '-',
      'Bodega Inicio': log.startTime || '-',
      'Bodega Fin': log.endTime || '-',
      'Bodega Nombre': log.warehouseName || '-',
      Descripción: log.description || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, `Registros_Mensuales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = (workerId: string) => {
    const workerName = getWorkerName(workerId);
    const workerLogs = logs.filter(l => l.workerId === workerId);
    
    if (workerLogs.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin registros',
        text: 'No hay registros para este armador.',
        confirmButtonColor: '#ff7043',
      });
      return;
    }

    const doc = new jsPDF();
    doc.text(`Reporte de Trabajo: ${workerName}`, 14, 15);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = workerLogs.map(log => [
      log.date,
      log.type === 'bike' ? 'Bici' : log.type === 'furniture' ? 'Mueble' : 'Apoyos',
      log.type === 'bike' ? getBikeCode(log.bikeId!) : log.type === 'furniture' ? log.furnitureCode! : log.warehouseName!,
      log.quantity ? log.quantity.toString() : `${log.startTime} - ${log.endTime}`,
      log.description || '-'
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Tipo', 'Código/Lugar', 'Cant/Horas', 'Descripción']],
      body: tableData,
    });

    doc.save(`Reporte_${workerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Registros y Exportación</h2>
      </div>

      <div className="card mb-4">
        <h3>Exportar Todos los Datos</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Descarga la consolidación total en Excel con todos los registros de todos los tiempos.</p>
        <button className="primary flex-center" onClick={exportToExcel} style={{ width: '100%' }}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Exportar Base de Datos a Excel
        </button>
      </div>

      <div className="card mb-4">
        <h3>Exportar Reportes Individuales (PDF)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selecciona un armador para descargar todo su historial en PDF.</p>
        <div className="grid">
          {workers.map(worker => (
            <button key={worker.id} className="secondary flex-center" onClick={() => exportToPDF(worker.id)}>
              <FileText size={18} style={{ marginRight: '8px' }} />
              Reporte {worker.name}
            </button>
          ))}
        </div>
      </div>

      <h3 className="mb-4">Historial de Registros</h3>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
          No hay registros en el sistema.
        </div>
      ) : (
        Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(year => (
          <div key={year} style={{ marginBottom: '1rem' }}>
            {/* Folder AÑO */}
            <div 
              className="card flex-between interactive" 
              style={{ padding: '1.2rem', cursor: 'pointer', backgroundColor: 'var(--bg-card)', marginBottom: '4px' }}
              onClick={() => toggleYear(year)}
            >
              <div className="flex-center">
                <Folder className="text-accent" size={24} style={{ marginRight: '10px' }} />
                <strong style={{ fontSize: '1.2rem' }}>Año {year}</strong>
              </div>
              {expandedYears[year] ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </div>

            {/* Contenido AÑO */}
            {expandedYears[year] && (
              <div style={{ marginLeft: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem' }}>
                {Object.keys(grouped[year]).map(month => {
                  const monthKey = `${year}-${month}`;
                  const monthLogs = grouped[year][month];
                  return (
                    <div key={monthKey} style={{ marginTop: '0.5rem' }}>
                      
                      {/* Folder MES */}
                      <div 
                        className="flex-between interactive" 
                        style={{ padding: '1rem', cursor: 'pointer', backgroundColor: '#2a2a2a', borderRadius: '4px' }}
                        onClick={() => toggleMonth(monthKey)}
                      >
                        <div className="flex-center">
                          <Folder style={{ color: 'var(--accent-yellow)', marginRight: '10px' }} size={20} />
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{month} <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '10px' }}>({monthLogs.length} registros)</span></span>
                        </div>
                        {expandedMonths[monthKey] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>

                      {/* Contenido MES (Tabla de registros) */}
                      {expandedMonths[monthKey] && (
                        <div style={{ marginTop: '0.5rem', overflowX: 'auto' }}>
                          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead>
                              <tr style={{ backgroundColor: 'var(--bg-card)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Fecha</th>
                                <th style={{ padding: '12px' }}>Armador</th>
                                <th style={{ padding: '12px' }}>Tipo</th>
                                <th style={{ padding: '12px' }}>Detalle</th>
                                <th style={{ padding: '12px' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {monthLogs.map(log => (
                                <tr key={log.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '12px' }}>{log.date}</td>
                                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{getWorkerName(log.workerId)}</td>
                                  <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                      padding: '4px 8px', 
                                      borderRadius: '4px', 
                                      fontSize: '0.8rem',
                                      backgroundColor: log.type === 'bike' ? 'rgba(255,112,67,0.2)' : log.type === 'furniture' ? 'rgba(255,202,40,0.2)' : 'rgba(100,181,246,0.2)',
                                      color: log.type === 'bike' ? 'var(--accent-orange)' : log.type === 'furniture' ? 'var(--accent-yellow)' : '#64b5f6'
                                    }}>
                                      {log.type.toUpperCase()}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    {log.type === 'bike' && `Bici: ${getBikeCode(log.bikeId!)} (x${log.quantity})`}
                                    {log.type === 'furniture' && `Mueble: ${log.furnitureCode} (x${log.quantity})`}
                                    {log.type === 'warehouse' && `Bodega: ${log.warehouseName} (${log.startTime} a ${log.endTime})`}
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <button 
                                      className="secondary" 
                                      style={{ padding: '0.4rem', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }} 
                                      onClick={() => handleEditLog(log)}
                                      title="Editar registro"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      className="secondary" 
                                      style={{ padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                                      onClick={() => handleRemoveLog(log.id)}
                                      title="Eliminar registro"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
