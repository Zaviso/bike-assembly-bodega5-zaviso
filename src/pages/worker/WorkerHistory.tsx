import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { getAppData, type BikeCatalogItem, type Worker, type LogEntry } from '../../store';

export function WorkerHistory() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<BikeCatalogItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [selectedWorker, setSelectedWorker] = useState(localStorage.getItem('lastSelectedWorker') || '');
  
  // Accordion states
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAppData().then(data => {
      setCatalog(data.catalog);
      setWorkers(data.workers);
      setLogs(data.logs);
    });
  }, []);

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWorker(val);
    localStorage.setItem('lastSelectedWorker', val);
  };

  const toggleYear = (year: string) => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  const toggleMonth = (monthKey: string) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  const toggleDay = (dayKey: string) => setExpandedDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));

  const myLogs = logs.filter(l => l.type === 'bike' && l.workerId === selectedWorker);
  
  // Grouping logic
  const grouped: Record<string, Record<string, Record<string, Record<string, number>>>> = {};
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  myLogs.forEach(log => {
    const [year, monthNum] = log.date.split('-');
    const monthName = monthNames[parseInt(monthNum) - 1];

    const bike = catalog.find(b => b.id === log.bikeId);
    const code = bike ? bike.code : 'Desconocido';

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][monthName]) grouped[year][monthName] = {};
    if (!grouped[year][monthName][log.date]) grouped[year][monthName][log.date] = {};
    
    if (!grouped[year][monthName][log.date][code]) {
      grouped[year][monthName][log.date][code] = 0;
    }
    grouped[year][monthName][log.date][code] += (log.quantity || 1);
  });

  return (
    <div className="app-container animate-fade-in">
      <div className="flex-between mb-4">
        <button type="button" className="secondary flex-center" onClick={() => navigate('/worker')}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Atrás
        </button>
        <h2 className="text-accent">Mi Historial</h2>
      </div>

      <div className="card mb-4" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="mb-2">
          <label>Tu Nombre (Armador)</label>
          <select value={selectedWorker} onChange={handleWorkerChange} required>
            <option value="">-- Selecciona tu nombre --</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedWorker ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          Selecciona tu nombre para ver tu historial.
        </div>
      ) : (
        <div>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
              No hay bicicletas registradas en tu historial.
            </div>
          ) : (
            Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(year => (
              <div key={year} style={{ marginBottom: '0.5rem' }}>
                <div 
                  className="card flex-between interactive" 
                  style={{ padding: '1rem', cursor: 'pointer', backgroundColor: 'var(--bg-card)', marginBottom: '2px' }}
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex-center">
                    <Folder className="text-accent" size={20} style={{ marginRight: '10px' }} />
                    <strong style={{ fontSize: '1.2rem' }}>Año {year}</strong>
                  </div>
                  {expandedYears[year] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>

                {expandedYears[year] && (
                  <div style={{ marginLeft: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.5rem' }}>
                    {Object.keys(grouped[year]).map(month => {
                      const monthKey = `${year}-${month}`;
                      return (
                        <div key={monthKey} style={{ marginTop: '0.5rem' }}>
                          <div 
                            className="flex-between interactive" 
                            style={{ padding: '0.8rem', cursor: 'pointer', backgroundColor: '#2a2a2a', borderRadius: '4px' }}
                            onClick={() => toggleMonth(monthKey)}
                          >
                            <div className="flex-center">
                              <Folder style={{ color: 'var(--accent-yellow)', marginRight: '10px' }} size={18} />
                              <span style={{ fontWeight: 'bold' }}>{month}</span>
                            </div>
                            {expandedMonths[monthKey] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </div>

                          {expandedMonths[monthKey] && (
                            <div style={{ marginLeft: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.5rem' }}>
                              {Object.keys(grouped[year][month]).sort((a, b) => b.localeCompare(a)).map(date => {
                                const dayKey = `${year}-${month}-${date}`;
                                const totalDayBikes = Object.values(grouped[year][month][date]).reduce((a, b) => a + b, 0);
                                
                                return (
                                  <div key={dayKey} style={{ marginTop: '0.5rem' }}>
                                    <div 
                                      className="flex-between interactive" 
                                      style={{ padding: '0.6rem', cursor: 'pointer', backgroundColor: 'var(--bg-dark)', borderRadius: '4px' }}
                                      onClick={() => toggleDay(dayKey)}
                                    >
                                      <span>Fecha: <strong style={{ color: 'var(--text-primary)' }}>{date}</strong></span>
                                      <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {totalDayBikes} bicis {expandedDays[dayKey] ? <ChevronDown size={16} style={{ verticalAlign: 'middle' }} /> : <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />}
                                      </span>
                                    </div>

                                    {expandedDays[dayKey] && (
                                      <div style={{ padding: '0.5rem 1rem', backgroundColor: '#1e1e1e', borderRadius: '0 0 4px 4px', fontSize: '0.9rem' }}>
                                        {Object.entries(grouped[year][month][date])
                                          .sort(([codeA], [codeB]) => codeA.localeCompare(codeB, undefined, { numeric: true }))
                                          .map(([code, count]) => (
                                          <div key={code} className="flex-between" style={{ padding: '4px 0', borderBottom: '1px dashed #333' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{code}</span>
                                            <strong style={{ color: 'var(--text-primary)' }}>{count} u.</strong>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
      )}
    </div>
  );
}
