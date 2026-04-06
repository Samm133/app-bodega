import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0PJFvdngvjlykrTXa3st_Z0tLQhgWYVo",
  authDomain: "app-bodega-d07c8.firebaseapp.com",
  projectId: "app-bodega-d07c8",
  storageBucket: "app-bodega-d07c8.firebasestorage.app",
  messagingSenderId: "817752054410",
  appId: "1:817752054410:web:c23b5b98b0ce9f87342b73",
  measurementId: "G-RTNBRXVY8D"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
