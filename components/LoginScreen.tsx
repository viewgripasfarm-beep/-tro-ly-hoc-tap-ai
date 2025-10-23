import React from 'react';
import { auth, isFirebaseConfigured } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { GoogleIcon } from './icons';

const FirebaseWarning: React.FC = () => (
    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6" role="alert">
        <p className="font-bold">Lỗi Cấu hình Firebase</p>
        <p className="text-sm">
            Thông tin cấu hình Firebase không hợp lệ. Vui lòng cập nhật tệp <strong>`firebaseConfig.ts`</strong> với khóa API hợp lệ và các chi tiết khác từ dự án Firebase của bạn.
        </p>
    </div>
);

const LoginScreen: React.FC = () => {
  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
        console.error("Firebase chưa được cấu hình. Vui lòng cập nhật firebaseConfig.ts");
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Lỗi đăng nhập với Google: ", error);
      let errorMessage = "Đã xảy ra lỗi khi đăng nhập. Vui lòng kiểm tra lại cấu hình Firebase và thử lại.";
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Lỗi Miền không được phép: Miền "${window.location.hostname}" chưa được thêm vào danh sách Miền được ủy quyền trong Bảng điều khiển Firebase. Vui lòng truy cập mục 'Authentication' -> 'Sign-in method' -> 'Authorized domains' và thêm miền này vào.`;
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Lỗi Cấu hình: Phương thức đăng nhập Google chưa được bật trong Bảng điều khiển Firebase. Vui lòng truy cập mục 'Authentication' -> 'Sign-in method' và bật nhà cung cấp Google.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Không hiển thị cảnh báo nếu người dùng cố tình đóng cửa sổ đăng nhập.
        return;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm mx-auto w-full">
        <div className="mx-auto bg-blue-600 p-3 rounded-xl inline-block mb-4">
            <i className="fas fa-graduation-cap text-4xl text-white"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-2">Trợ lý Học tập Cá nhân</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Đăng nhập để bắt đầu quản lý kế hoạch học tập của bạn.</p>
        
        {!isFirebaseConfigured && <FirebaseWarning />}

        <button
          onClick={handleGoogleSignIn}
          disabled={!isFirebaseConfigured}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon className="w-6 h-6" />
          <span>Đăng nhập với Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;