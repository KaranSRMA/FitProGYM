import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAuth } from './authSlice';
import axios from 'axios';
import { Mail, CircleCheckBig, Lock, UserPlus, AlertTriangle, User, Phone, MapPin, Target, Dumbbell, Eye, EyeOff } from 'lucide-react';

// Input component helper for consistency
const InputField = ({ id, type = 'text', value, onChange, placeholder, Icon, label }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-zinc-300 block mb-2">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-red-500 focus:border-red-500 transition-colors"
                aria-label={label}
            />
        </div>
    </div>
);

export function SignUp() {
    // Member Information State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState('lose_weight');
    const [experienceLevel, setExperienceLevel] = useState('beginner');

    // Authentication State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setsuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            } else if (role==='admin'){
                const timer = setTimeout(() => {
                    navigate('/admin/dashboard')
                }, 2000);
                return ()=> clearTimeout(timer);
            }

        }
    }, [loggedIn, role, is_active, navigate]);

    // Simple email format validation (for instant UI feedback)
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Simple phone number validation (basic check for digits/length)
    const isValidPhone = (phone) => {
        const phoneRegex = /^(?:(?:\+91|0)?)[6-9]\d{9}$/;
        // Allows for common formats like 123-456-7890 or +1 (123) 456-7890
        return phoneRegex.test(phone);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        // 1. Basic Field Validation
        if (!name || !email || !phone || !address || !fitnessGoal || !experienceLevel || !password || !confirmPassword) {
            setErrorMessage('All fields are required.');
            setIsLoading(false);
            return;
        }

        // 2. Format Validation
        if (!isValidEmail(email)) {
            setErrorMessage('Please enter a valid email address.');
            setIsLoading(false);
            return;
        }

        if (!isValidPhone(phone)) {
            setErrorMessage('Please enter a valid phone number.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            // --- SERVER-SIDE AUTHENTICATION SIMULATION ---
            const registrationData = {
                name,
                email,
                phone,
                address,
                fitnessGoal,
                experienceLevel,
                password,
            };

            const res = await axios.post(`${BASE_URL}/auth/register`, registrationData, { withCredentials: true })


            // Clear form upon success
            setName('');
            setEmail('');
            setPhone('');
            setAddress('');
            setFitnessGoal('');
            setExperienceLevel('');
            setPassword('');
            setConfirmPassword('');
            setErrorMessage('');

            if (res.status === 201) {
                const data = res.data;
                setsuccessMessage(data?.message);
                justLoggedIn.current = true;
                dispatch(verifyAuth())

                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000);
            } else{
                setErrorMessage('Unexpected response status.')
                setIsLoading(false);
                return;
            }

        } catch (error) {
            let message = 'Registration failed. Please try again later!.';
            if (error.response && error.response?.data) {
                if (typeof error.response?.data?.detail === 'string') {
                    message = error.response?.data?.detail;
                } else if (Array.isArray(error.response?.data?.detail)) {
                    const errorMessages = error.response?.data?.detail.map(err => err.msg);
                    message = errorMessages.join(', ');
                }
            }
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
                className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-10 shadow-2xl"
            >
                <h1 className="text-white text-3xl font-bold mb-2 text-center">
                    New Member Registration
                </h1>
                <p className="text-zinc-400 mb-8 text-center">
                    Tell us a bit about yourself to start your journey!
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

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Name */}
                        <InputField
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            Icon={User}
                            label="Full Name"
                        />

                        {/* Email */}
                        <InputField
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            Icon={Mail}
                            label="Email Address"
                        />

                        {/* Phone */}
                        <InputField
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="123-456-7890"
                            Icon={Phone}
                            label="Phone Number"
                        />

                        {/* Address */}
                        <InputField
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Gym Ave"
                            Icon={MapPin}
                            label="Residential Address"
                        />
                    </div>

                    {/* Gym Details Section */}
                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/50">
                        {/* Fitness Goal Dropdown */}
                        <div>
                            <label htmlFor="fitnessGoal" className="text-sm font-medium text-zinc-300 block mb-2">Primary Fitness Goal</label>
                            <div className="relative">
                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
                                <select
                                    id="fitnessGoal"
                                    value={fitnessGoal}
                                    onChange={(e) => setFitnessGoal(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 appearance-none focus:ring-red-500 focus:border-red-500 transition-colors"
                                    aria-label="Fitness Goal"
                                >
                                    <option value="lose_weight">Weight Loss</option>
                                    <option value="gain_muscle">Muscle Gain</option>
                                    <option value="improve_endurance">Endurance/Cardio</option>
                                    <option value="general_fitness">General Health</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    &#9662; {/* Down arrow */}
                                </div>
                            </div>
                        </div>

                        {/* Experience Level Dropdown */}
                        <div>
                            <label htmlFor="experienceLevel" className="text-sm font-medium text-zinc-300 block mb-2">Experience Level</label>
                            <div className="relative">
                                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
                                <select
                                    id="experienceLevel"
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 appearance-none focus:ring-red-500 focus:border-red-500 transition-colors"
                                    aria-label="Experience Level"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    &#9662; {/* Down arrow */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Authentication Details Section */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className='relative'>
                            {/* Password */}
                            <InputField
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                Icon={Lock}
                                label="Password (Min 6 chars)"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-13 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="size-5" />
                                ) : (
                                    <Eye className="size-5" />
                                )}
                            </button>
                        </div>
                        {/* Confirm Password */}
                        <InputField
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            Icon={Lock}
                            label="Confirm Password"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
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
                                <UserPlus className="size-5" />
                                Register & Start Training
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-zinc-400">
                    <p className="text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                            Sign In Here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}