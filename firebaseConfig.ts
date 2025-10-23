import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// CẢNH BÁO QUAN TRỌNG!
// BẠN CẦN THAY THẾ CÁC GIÁ TRỊ DƯỚI ĐÂY BẰNG CẤU HÌNH DỰ ÁN FIREBASE CỦA BẠN.
//
// 1. Truy cập trang tổng quan dự án Firebase của bạn: https://console.firebase.google.com/
// 2. Đi tới "Cài đặt dự án" (biểu tượng bánh răng).
// 3. Trong tab "Chung", cuộn xuống phần "Ứng dụng của bạn".
// 4. Tìm ứng dụng web của bạn và sao chép đối tượng cấu hình (firebaseConfig).
// 5. Dán nó vào đây để thay thế các giá trị giữ chỗ.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBNto9Y8efU6DLu2CyTPLKXUf4fmgWpqTg",
  authDomain: "tro-ly-hoc-tap-ai-a3347.firebaseapp.com",
  projectId: "tro-ly-hoc-tap-ai-a3347",
  storageBucket: "tro-ly-hoc-tap-ai-a3347.firebasestorage.app",
  messagingSenderId: "58256333821",
  appId: "1:58256333821:web:92b5aa25a6d5fc90375794",
  measurementId: "G-SWK50JZJTM"
};

// Kiểm tra xem cấu hình có phải là giá trị giữ chỗ hay không
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Lấy các dịch vụ Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);