import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbQhA87wBPUEkh-u-I3o9T5Ju8UKqTSFc",
  authDomain: "tracker-bodega-zaviso.firebaseapp.com",
  projectId: "tracker-bodega-zaviso",
  storageBucket: "tracker-bodega-zaviso.firebasestorage.app",
  messagingSenderId: "595888332356",
  appId: "1:595888332356:web:82e6b4eae420a8b94da611"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});
