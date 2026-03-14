import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // THÊM DÒNG NÀY

const firebaseConfig = {
  apiKey: "AIzaSyBObHDAtogbX7DihvoBEDHS-1MNjwe0-20",
  authDomain: "smartstudyr-1f6c8.firebaseapp.com",
  databaseURL: "https://smartstudyr-1f6c8-default-rtdb.firebaseio.com",
  projectId: "smartstudyr-1f6c8",
  storageBucket: "smartstudyr-1f6c8.firebasestorage.app",
  messagingSenderId: "382054465900",
  appId: "1:382054465900:web:03e1590347d1f843d67349",
  measurementId: "G-S3VF7M3TVZ"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // THÊM DÒNG NÀY ĐỂ CÁC FILE KHÁC CÓ THỂ GỌI 'db'