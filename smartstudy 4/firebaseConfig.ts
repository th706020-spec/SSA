// Import đầy đủ các thư viện cần thiết từ Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cấu hình chuẩn của dự án SmartStudyR
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

// Khởi tạo các dịch vụ
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Xuất Auth và Database ra để các file khác sử dụng
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;