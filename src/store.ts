
import { collection, getDocs, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Worker = {
  id: string;
  name: string;
};

export type BikeCatalogItem = {
  id: string;
  code: string;
  description: string;
  image: string; // Base64 or URL
};

export type LogType = 'bike' | 'furniture' | 'warehouse';

export type LogEntry = {
  id: string;
  type: LogType;
  workerId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  description?: string;
  
  // Bike / Furniture
  quantity?: number;
  
  // Bike Specific
  bikeId?: string;
  
  // Furniture Specific
  furnitureCode?: string;
  
  // Warehouse Specific
  startTime?: string;
  endTime?: string;
  warehouseName?: string;
};

export type AppData = {
  workers: Worker[];
  catalog: BikeCatalogItem[];
  logs: LogEntry[];
};

const DEFAULT_DATA: AppData = {
  workers: [
    { id: '1', name: 'Armador 1' },
    { id: '2', name: 'Armador 2' }
  ],
  catalog: [
    { id: '1', code: 'BIC-MTB-01', description: 'Bicicleta Mountain Bike Aro 29', image: '' }
  ],
  logs: []
};

export const getAppData = async (): Promise<AppData> => {
  try {
    const workersSnapshot = await getDocs(collection(db, 'workers'));
    const catalogSnapshot = await getDocs(collection(db, 'catalog'));
    const logsSnapshot = await getDocs(collection(db, 'logs'));

    const workers = workersSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Worker));
    const catalog = catalogSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as BikeCatalogItem));
    const logs = logsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as LogEntry));

    // If completely empty, you can still return the fetched empty arrays,
    // but the user might expect default data if they just started.
    // For now, let's just return what is in the DB.
    if (workers.length === 0 && catalog.length === 0 && logs.length === 0) {
       // Return empty arrays instead of DEFAULT_DATA to avoid confusion, 
       // or we could push default data to firebase here, but let's just return empty.
    }

    return { workers, catalog, logs };
  } catch (error) {
    console.error("Error fetching data from Firebase:", error);
    return { workers: [], catalog: [], logs: [] };
  }
};

export const addLog = async (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
  const newLog = {
    ...log,
    timestamp: Date.now()
  };
  await addDoc(collection(db, 'logs'), newLog);
};

export const addBikeToCatalog = async (bike: Omit<BikeCatalogItem, 'id'>) => {
  await addDoc(collection(db, 'catalog'), bike);
};

export const removeBikeFromCatalog = async (id: string) => {
  await deleteDoc(doc(db, 'catalog', id));
};

export const addWorker = async (name: string) => {
  await addDoc(collection(db, 'workers'), { name });
};

export const removeWorker = async (id: string) => {
  await deleteDoc(doc(db, 'workers', id));
};
