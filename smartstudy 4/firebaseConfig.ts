import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBObHDAtogbX7DihvoBEDHS-1MNjwe0-20",
  authDomain: "smartstudyr-1f6c8.firebaseapp.com",
  projectId: "smartstudyr-1f6c8",
  storageBucket: "smartstudyr-1f6c8.firebasestorage.app",
  messagingSenderId: "382054465900",
  appId: "1:382054465900:web:03e1590347d1f843d67349",
  measurementId: "G-S3VF7M3TVZ"
};

// Khởi tạo app
const app = initializeApp(firebaseConfig);

// Xuất trực tiếp biến db và auth ra ngoài
export const db = getFirestore(app);
export const auth = getAuth(app);