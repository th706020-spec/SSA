import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { auth } from '../firebaseConfig'; // Gọi Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AuthProps {
    onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Mẹo: Firebase bắt buộc dùng Email, nên ta tự động thêm đuôi giả
    const getFakeEmail = (name: string) => `${name.toLowerCase().replace(/\s/g, '')}@smartstudy.local`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const email = getFakeEmail(username);

        try {
            if (isLogin) {
                // --- XỬ LÝ ĐĂNG NHẬP ---
                await signInWithEmailAndPassword(auth, email, password);
                // Đăng nhập thành công -> Firebase sẽ tự báo cho App.tsx biết
            } else {
                // --- XỬ LÝ ĐĂNG KÝ ---
                // 1. Tạo tài khoản
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // 2. Cập nhật tên hiển thị (Username)
                if (userCredential.user) {
                    await updateProfile(userCredential.user, {
                        displayName: username
                    });
                }
            }
        } catch (err: any) {
            console.error(err);
            // Dịch lỗi Firebase sang tiếng Việt cho dễ hiểu
            if (err.code === 'auth/email-already-in-use') {
                setError('Tên đăng nhập này đã có người dùng.');
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Sai tên đăng nhập hoặc mật khẩu.');
            } else if (err.code === 'auth/weak-password') {
                setError('Mật khẩu phải có ít nhất 6 ký tự.');
            } else {
                setError('Đã có lỗi xảy ra: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#151521] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e2d] w-full max-w-md rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        SmartStudy Rhythm
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isLogin ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252536] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Nhập tên của bạn"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252536] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Đang xử lý...'
                        ) : (
                            <>
                                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                        {isLogin ? (
                            <>
                                <UserPlus className="w-4 h-4" /> Chưa có tài khoản? Đăng ký ngay
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" /> Đã có tài khoản? Đăng nhập
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};