import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { verifyAuth } from './authSlice';
import axios from 'axios';
import { Mail, Lock, LogIn, AlertTriangle, Eye, EyeOff, CircleCheckBig } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setsuccessMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const justLoggedIn = useRef(false);
    const { loggedIn, role, is_active } = useSelector(state => state.auth || {})
    const dispatch = useDispatch();

    useEffect(() => {
        if (loggedIn && !justLoggedIn.current && is_active && role!=='user') {
            setsuccessMessage('User already LoggedIn, Redirecting...');
            if (role === 'member') {
                const timer = setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
                return () => clearTimeout(timer);
            } else if (role === 'admin') {
                const timer = setTimeout(() => {
                    navigate('/admin/dashboard')
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [loggedIn,role,is_active,navigate]);



    // Simple email format validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        if (!email || !password) {
            setErrorMessage('Email and Password fields are required.');
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }


        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password
            }, { withCredentials: true }
            )

            // Clear form upon success
            setEmail('');
            setPassword('');
            if (res.status == 200) {
                const data = res.data;
                setsuccessMessage(data?.message + ", Redirecting...");
                justLoggedIn.current = true;
                dispatch(verifyAuth())
                if (data?.is_active && data?.valid) {
                    if (data?.role == 'member') {
                        setTimeout(() => {
                            navigate('/dashboard')
                        }, 1000);
                    } else if (data?.role == 'admin'){
                        setTimeout(() => {
                            navigate('/admin/dashboard')
                        }, 1000);
                    }
                }
            } else{
                setErrorMessage('Unexpected response status.');
                setIsLoading(false);
                return;
            }
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed. Cannot connect to server.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-10 shadow-2xl"
            >
                <h1 className="text-white text-3xl font-bold mb-2 text-center">
                    Member Login
                </h1>
                <p className="text-zinc-400 mb-8 text-center">
                    Access your personalized fitness dashboard.
                </p>

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/30"
                    >
                        <AlertTriangle className="size-5" />
                        <span className="text-sm font-medium">{errorMessage}</span>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 bg-green-500 text-black-400 p-4 rounded-lg mb-6 border border-white-500/30"
                    >
                        <CircleCheckBig className="size-5" />
                        <span className="text-sm font-medium">{successMessage}</span>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300 block mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-red-500 focus:border-red-500 transition-colors"
                                required
                                aria-label="Email Address"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-zinc-300 block mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-red-500 focus:border-red-500 transition-colors"
                                required
                                aria-label="Password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="size-5" />
                                ) : (
                                    <Eye className="size-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold transition-all shadow-lg ${isLoading ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                            }`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <LogIn className="size-5" />
                                Sign In
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-zinc-400">
                    <p className="text-sm">
                        Don't have an account yet?{' '}
                        <Link to="/signup" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                            Register Here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}