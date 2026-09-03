import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAppData, type LogEntry, type Worker, type BikeCatalogItem } from '../../store';
import Swal from 'sweetalert2';

export function LogsViewer() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);

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
      log.type === 'bike' ? 'Bici' : log.type === 'furniture' ? 'Mueble' : 'Apoyos fuera de la bodega 5',
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
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button className="secondary flex-center" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Registros y Exportación</h2>
      </div>

      <div className="card mb-4">
        <h3>Exportar Todos los Datos</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Descarga la consolidación mensual en Excel con todos los registros.</p>
        <button className="primary flex-center" onClick={exportToExcel} style={{ width: '100%' }}>
          <Download size={18} style={{ marginRight: '8px' }} />
          Exportar a Excel (.xlsx)
        </button>
      </div>

      <div className="card mb-4">
        <h3>Exportar Reportes Individuales (PDF)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selecciona un armador para descargar su reporte PDF.</p>
        <div className="grid">
          {workers.map(worker => (
            <button key={worker.id} className="secondary flex-center" onClick={() => exportToPDF(worker.id)}>
              <FileText size={18} style={{ marginRight: '8px' }} />
              Reporte {worker.name}
            </button>
          ))}
        </div>
      </div>

      <h3>Historial de Registros</h3>
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-card)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Fecha</th>
              <th style={{ padding: '12px' }}>Armador</th>
              <th style={{ padding: '12px' }}>Tipo</th>
              <th style={{ padding: '12px' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
