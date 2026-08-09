import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Lock, User, AlertTriangle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const { direction, t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Authenticate guard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    // Session expired alert
    useEffect(() => {
        if (searchParams.get('expired') === 'true') {
            setErrorMsg('Your session has expired. Please log in again.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameInput || !passwordInput) return;

        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await api.auth.login({
                username: usernameInput,
                password: passwordInput,
            });

            if (res.success && res.data.token) {
                login(res.data.token, usernameInput);
                navigate('/admin');
            } else {
                setErrorMsg(t('invalidCoupon'));
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070709] flex items-center justify-center px-4 py-12 select-none font-sans" dir={direction}>

            {/* Decorative Blur Accent */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-gold-500/5 filter blur-3xl top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-md space-y-8 bg-zinc-950 p-8 rounded-3xl border border-zinc-900 shadow-2xl relative z-10">

                {/* Header Title */}
                <div className="text-center space-y-2">
                    <span className="font-sans text-3xl font-extrabold tracking-widest bg-gradient-to-r from-white to-gold-400 bg-clip-text text-transparent">
                        HISTERIA
                    </span>
                    <h2 className="text-lg font-semibold text-zinc-300">
                        {t('adminLogin')}
                    </h2>
                    <p className="text-xs text-zinc-500">
                        {direction === 'rtl' ? 'الرجاء إدخال بيانات الاعتماد الممنوحة للوصول للوحة التحكم.' : 'Please enter your administrator credentials to proceed.'}
                    </p>
                </div>

                {/* Action Form */}
                <form onSubmit={handleSubmit} className="space-y-6 mt-8">

                    {/* Error logger */}
                    {errorMsg && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs font-semibold leading-relaxed">
                            <AlertTriangle size={18} className="flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="space-y-4">

                        {/* Username Input */}
                        <div className="relative">
                            <User
                                size={18}
                                className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-4' : 'left-4'
                                    }`}
                            />
                            <input
                                type="text"
                                required
                                placeholder={t('username')}
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className={`w-full bg-zinc-900/60 border border-zinc-850 text-zinc-100 placeholder-zinc-650 rounded-xl py-3.5 focus:outline-none focus:border-gold-400 text-sm font-medium ${direction === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'
                                    }`}
                                dir="ltr"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <Lock
                                size={18}
                                className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 ${direction === 'rtl' ? 'right-4' : 'left-4'
                                    }`}
                            />
                            <input
                                type="password"
                                required
                                placeholder={t('password')}
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={`w-full bg-zinc-900/60 border border-zinc-850 text-zinc-100 placeholder-zinc-650 rounded-xl py-3.5 focus:outline-none focus:border-gold-400 text-sm font-medium ${direction === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'
                                    }`}
                                dir="ltr"
                            />
                        </div>

                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-black font-extrabold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wider shadow-lg shadow-gold-500/10"
                    >
                        {loading ? t('loggingIn') : t('login')}
                    </button>

                </form>

                {/* Back Link to shop */}
                <div className="text-center mt-5">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-xs text-zinc-500 hover:text-gold-400 font-semibold transition-colors cursor-pointer"
                    >
                        {direction === 'rtl' ? '← العودة للمتجر الرئيسي' : '← Back to main store'}
                    </button>
                </div>

            </div>

        </div>
    );
};
