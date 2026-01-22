import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAD3Dky86qJeFXIpLIVI9h3P_bTYBVEIAM",
  authDomain: "bahan-live.firebaseapp.com",
  databaseURL: "https://bahan-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bahan-live",
  storageBucket: "bahan-live.firebasestorage.app",
  messagingSenderId: "695969248559",
  appId: "1:695969248559:web:3839e9362ed0b7abf7ddda"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);