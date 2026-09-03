
import { collection, getDocs, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Worker = {
  id: string;
  name: string;
  createdAt?: number;
};

export type BikeCatalogItem = {
  id: string;
  code: string;
  description: string;
  image: string; // Base64 or URL
  createdAt?: number;
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



export const getAppData = async (): Promise<AppData> => {
  try {
    const workersSnapshot = await getDocs(collection(db, 'workers'));
    const catalogSnapshot = await getDocs(collection(db, 'catalog'));
    const logsSnapshot = await getDocs(collection(db, 'logs'));

    const workers = workersSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Worker));
    const catalog = catalogSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as BikeCatalogItem));
    const logs = logsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as LogEntry));

    // Ordenar por fecha de creación en el cliente para no ocultar los que no tienen createdAt
    workers.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    catalog.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

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
  await addDoc(collection(db, 'catalog'), { ...bike, createdAt: Date.now() });
};

export const removeBikeFromCatalog = async (id: string) => {
  await deleteDoc(doc(db, 'catalog', id));
};

export const addWorker = async (name: string) => {
  await addDoc(collection(db, 'workers'), { name, createdAt: Date.now() });
};

export const removeWorker = async (id: string) => {
  await deleteDoc(doc(db, 'workers', id));
};
