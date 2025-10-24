import React, { useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebaseConfig';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { GoogleIcon } from './icons';

const FirebaseWarning: React.FC = () => (
    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md my-6" role="alert">
        <p className="font-bold">Lỗi Cấu hình Firebase</p>
        <p className="text-sm">
            Thông tin cấu hình Firebase không hợp lệ. Vui lòng cập nhật tệp <strong>`firebaseConfig.ts`</strong> với khóa API hợp lệ và các chi tiết khác từ dự án Firebase của bạn.
        </p>
    </div>
);

const LoginScreen: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const translateFirebaseError = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Địa chỉ email không hợp lệ.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Email hoặc mật khẩu không đúng.';
        case 'auth/email-already-in-use':
            return 'Địa chỉ email này đã được sử dụng.';
        case 'auth/weak-password':
            return 'Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự.';
        case 'auth/unauthorized-domain':
            return `Lỗi Miền không được phép: Miền "${window.location.hostname}" chưa được thêm vào danh sách Miền được ủy quyền trong Bảng điều khiển Firebase.`;
        case 'auth/configuration-not-found':
            return "Lỗi Cấu hình: Phương thức đăng nhập Google chưa được bật trong Bảng điều khiển Firebase.";
        default:
            return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  };
  
  const switchView = (targetView: 'login' | 'signup' | 'forgotPassword') => {
    setView(targetView);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) return;
    
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
        if (view === 'signup') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const displayName = email.split('@')[0];
            await updateProfile(userCredential.user, { displayName });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (err: any) {
        console.error("Lỗi xác thực: ", err);
        setError(translateFirebaseError(err.code));
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !email) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
        await sendPasswordResetEmail(auth, email);
        setMessage('Một email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến của bạn.');
        setView('login');
    } catch (err: any) {
        console.error("Lỗi đặt lại mật khẩu:", err);
        setError(translateFirebaseError(err.code));
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) return;

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Lỗi đăng nhập với Google: ", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(translateFirebaseError(error.code));
      }
    }
  };
  
  const titles = {
      login: 'Trợ lý Học tập Cá nhân',
      signup: 'Tạo tài khoản',
      forgotPassword: 'Quên mật khẩu?'
  };
  
  const descriptions = {
      login: 'Đăng nhập để quản lý kế hoạch của bạn.',
      signup: 'Tạo tài khoản mới để bắt đầu.',
      forgotPassword: 'Nhập email của bạn để nhận liên kết đặt lại.'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4">
      <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm mx-auto w-full transition-all duration-300">
        <div className="text-center mb-6">
            <div className="mx-auto bg-blue-600 p-3 rounded-xl inline-block mb-4">
                <i className="fas fa-graduation-cap text-4xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-2">{titles[view]}</h1>
            <p className="text-slate-500 dark:text-slate-400">{descriptions[view]}</p>
        </div>
        
        {!isFirebaseConfigured && <FirebaseWarning />}

        {message && <p className="text-green-600 dark:text-green-400 text-sm text-center bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mb-4">{error}</p>}

        {view === 'forgotPassword' ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-slate-700 dark:text-white dark:placeholder-gray-400" />
            </div>
            <button type="submit" disabled={isLoading || !isFirebaseConfigured} className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Gửi liên kết đặt lại'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuthAction} className="space-y-4">
            <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-slate-700 dark:text-white dark:placeholder-gray-400" />
            </div>
            <div>
                <label className="sr-only" htmlFor="password">Mật khẩu</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" required minLength={6} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-slate-700 dark:text-white dark:placeholder-gray-400" />
            </div>
             {view === 'login' && (
                <div className="text-right -mt-2">
                    <button type="button" onClick={() => switchView('forgotPassword')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 focus:outline-none">
                        Quên mật khẩu?
                    </button>
                </div>
            )}
            <button type="submit" disabled={isLoading || !isFirebaseConfigured} className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : (view === 'signup' ? 'Đăng ký' : 'Đăng nhập')}
            </button>
          </form>
        )}
        
        {view !== 'forgotPassword' && (
          <>
            <div className="flex items-center my-6">
                <hr className="flex-grow border-slate-300 dark:border-slate-600"/>
                <span className="mx-4 text-sm font-semibold text-slate-400 dark:text-slate-500">HOẶC</span>
                <hr className="flex-grow border-slate-300 dark:border-slate-600"/>
            </div>
            <button onClick={handleGoogleSignIn} disabled={!isFirebaseConfigured} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <GoogleIcon className="w-6 h-6" />
              <span>Tiếp tục với Google</span>
            </button>
          </>
        )}

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {view === 'login' && (
                <>Chưa có tài khoản? <button onClick={() => switchView('signup')} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 ml-1">Đăng ký ngay</button></>
            )}
            {view === 'signup' && (
                <>Đã có tài khoản? <button onClick={() => switchView('login')} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 ml-1">Đăng nhập</button></>
            )}
            {view === 'forgotPassword' && (
                <button onClick={() => switchView('login')} className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500">Quay lại Đăng nhập</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
