import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { logout } from './authSlice';
import axios from 'axios';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    Activity,
    Trophy,
    Bell,
    CreditCard,
    CheckCircle2,
    LogIn,
    LogOut,
    Dumbbell,
    Users,
    Target,
    Scale,
    Ruler,
    BarChart3
} from 'lucide-react';

export function Dashboard() {
    const bodyMeasurements = {
        weight: '185 lbs',
        height: '6\'0"',
        bmi: '25.1',
        bodyFat: '18%',
        lastUpdated: '2025-11-15',
    };

    const [checkedIn, setCheckedIn] = useState(false);
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const [bmiValue, setBmiValue] = useState(bodyMeasurements.bmi || null);
    const [bmiCategory, setBmiCategory] = useState("");
    const [showBar, setShowBar] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);
    const scannerRef = useRef(null);

    const REST_API = import.meta.env.VITE_REST_API;
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const dispatch = useDispatch();
    const { loggedIn, role, is_active } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const handleStartScanning = () => {
        setScannerLoading(true);
        setScanning(true);
    };

    const stopScanner = useCallback(async () => {
        if (!scannerRef.current) return;
        try {
            await scannerRef.current.stop();
        } catch {
            // Ignore stop errors when scanner is already stopped.
        }
        try {
            await scannerRef.current.clear();
        } catch {
            // Ignore clear errors when scanner is already cleared.
        }
        scannerRef.current = null;
    }, []);

    const handleCancel = async () => {
        setScannerLoading(false);
        await stopScanner();
        setScanning(false);
    };


    const onScanSuccess = useCallback(async (scanned_token) => {
        setScannerLoading(false);
        await stopScanner();
        setScanning(false);

        try {
            const response = await axios.post(
                `${REST_API}/verifyCheckin/${scanned_token}`,
                {},
                { withCredentials: true }
            );
            if (response.status === 200) {
                setCheckedIn(true);
                toast.success(response?.data?.message || "Check-in Successful!");
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || "Invalid or Expired QR");
        }
    }, [REST_API, stopScanner]);

    useEffect(() => {
        let isCancelled = false;

        const startScanner = async () => {
            if (!scanning) return;
            setScannerLoading(true);

            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;

            const scanConfig = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                videoConstraints: {
                    facingMode: { ideal: "environment" }
                }
            };

            try {
                const cameras = await Html5Qrcode.getCameras();
                if (isCancelled) return;

                const backCamera = cameras.find((camera) =>
                    /(back|rear|environment)/i.test(camera.label)
                );

                const primaryCameraConfig = backCamera
                    ? { deviceId: { exact: backCamera.id } }
                    : { facingMode: { ideal: "environment" } };

                await scanner.start(
                    primaryCameraConfig,
                    scanConfig,
                    onScanSuccess,
                    () => {
                        // Intentionally empty to avoid excessive re-renders.
                    }
                );
                setScannerLoading(false);
            } catch {
                if (isCancelled) return;
                try {
                    await scanner.start(
                        { facingMode: "user" },
                        scanConfig,
                        onScanSuccess,
                        () => {
                            // Intentionally empty to avoid excessive re-renders.
                        }
                    );
                    setScannerLoading(false);
                } catch {
                    setScannerLoading(false);
                    toast.error("Unable to open camera. Use HTTPS and allow camera access.");
                    await stopScanner();
                    setScanning(false);
                }
            }
        };

        startScanner();

        return () => {
            isCancelled = true;
            setScannerLoading(false);
            stopScanner();
        };
    }, [scanning, onScanSuccess, stopScanner]);


    useEffect(() => {
        if (!loggedIn || role !== 'member' || !is_active) {
            navigate('/login');
        }
    }, [loggedIn, role, is_active, navigate]);

    const calculateBMI = () => {
        const weight = parseFloat(bodyMeasurements.weight);
        const heightInMeters = parseFloat(bodyMeasurements.height) / 100;

        if (!weight || !heightInMeters) return;

        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setBmiValue(bmi);
        setShowBar(true);

        // Category
        if (bmi < 18.5) setBmiCategory("Underweight");
        else if (bmi < 25) setBmiCategory("Normal");
        else if (bmi < 30) setBmiCategory("Overweight");
        else setBmiCategory("Obese");
    };

    // Indicator Position
    const getIndicatorPosition = () => {
        const bmiNum = parseFloat(bmiValue);
        if (!bmiNum) return "0%";
        const percent = Math.min((bmiNum / 40) * 100, 100);
        return `${percent}%`;
    };

    const userStats = [
        {
            title: 'Monthly Attendance',
            value: '18/30',
            change: '+3 from last month',
            icon: Calendar,
            color: 'text-blue-500',
            progress: 60,
        },
        {
            title: 'Workout Streak',
            value: '7 Days',
            change: 'Personal best: 12 days',
            icon: TrendingUp,
            color: 'text-green-500',
            progress: 58,
        },
        {
            title: 'Goals Achieved',
            value: '4/6',
            change: '2 more to go',
            icon: Trophy,
            color: 'text-yellow-500',
            progress: 67,
        },
    ];

    const membershipInfo = {
        plan: 'Premium',
        startDate: '2024-06-01',
        nextPayment: '2025-12-01',
        amount: '$79',
        status: 'Active',
        daysLeft: 12,
    };

    const personalTrainer = {
        name: 'Alex Martinez',
        specialization: 'Strength & Conditioning',
        experience: '8 years',
        image: 'https://images.unsplash.com/photo-1540205453279-389ebbc43b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBjb2FjaGluZ3xlbnwxfHx8fDE3NjM0MzM3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        nextSession: 'Tomorrow, 10:00 AM',
        sessionsLeft: 3,
    };

    const paymentHistory = [
        { date: '2025-11-01', amount: '$79.00', plan: 'Premium Monthly', status: 'Paid' },
        { date: '2025-10-01', amount: '$79.00', plan: 'Premium Monthly', status: 'Paid' },
        { date: '2025-09-01', amount: '$79.00', plan: 'Premium Monthly', status: 'Paid' },
    ];

    const notifications = [
        {
            icon: Bell,
            title: 'Class Reminder',
            message: 'HIIT Training starts in 2 hours',
            time: '2 hours',
            type: 'info'
        },
        {
            icon: Trophy,
            title: 'Achievement Unlocked!',
            message: 'You completed 7-day workout streak',
            time: '5 hours',
            type: 'success'
        },
        {
            icon: CreditCard,
            title: 'Payment Due Soon',
            message: 'Membership renewal in 12 days',
            time: '1 day',
            type: 'warning'
        },
    ];

    const workoutPlan = [
        { day: 'Monday', focus: 'Chest & Triceps', exercises: 5, duration: '60 min' },
        { day: 'Tuesday', focus: 'Back & Biceps', exercises: 6, duration: '65 min' },
        { day: 'Wednesday', focus: 'Legs', exercises: 7, duration: '70 min' },
        { day: 'Thursday', focus: 'Shoulders', exercises: 5, duration: '55 min' },
        { day: 'Friday', focus: 'Full Body', exercises: 8, duration: '75 min' },
    ];


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true })
            dispatch(logout())
            setTimeout(() => {
                navigate('/login')
            }, 500);
        } catch {
            return;
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-white text-2xl font-bold mb-2">My Dashboard</h1>
                        <p className="text-zinc-400">Track your fitness journey and progress</p>
                    </div>
                    {loggedIn && (
                        <button
                            onClick={handleLogout}
                            variant="outline"
                            className="border cursor-pointer border-zinc-700 text-white hover:bg-zinc-700 flex items-center py-2 px-4 rounded-lg bg-zinc-800 gap-2"
                        >
                            <LogOut className="size-4" />
                            Logout
                        </button>
                    )}
                </motion.div>

                {/* Check-in Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className={`border-2 transition-all rounded-xl ${checkedIn
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-zinc-900 border-zinc-800'
                        }`}>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`size-16 rounded-full flex items-center justify-center ${checkedIn ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {checkedIn ? (
                                            <CheckCircle2 className="size-8 text-green-500" />
                                        ) : (
                                            <LogIn className="size-8 text-red-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl text-white mb-1">
                                            {checkedIn ? 'Checked In' : 'Quick Check-In'}
                                        </h3>
                                        <p className="text-zinc-400 text-sm">
                                            {checkedIn
                                                ? `You're all set! Checked in at ${currentTime}`
                                                : 'Tap to check-in to the gym'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {!checkedIn ? (
                                        <div>
                                            {!scanning ? (
                                                <button
                                                    onClick={() => { handleStartScanning(); }}
                                                    className="bg-red-500 cursor-pointer hover:bg-red-600 gap-2 px-4 py-2 flex items-center rounded-lg text-white"
                                                >
                                                    <LogIn className="size-4" />
                                                    Check In
                                                </button>
                                            ) : (
                                                <div className="w-full max-w-md">
                                                    <div className="relative">
                                                        <div
                                                            id="reader"
                                                            className="min-h-64 overflow-hidden rounded-xl border-2 border-red-500"
                                                        ></div>
                                                        {scannerLoading && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/70 text-white">
                                                                <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                                                <p className="text-sm">Opening camera...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => { handleCancel() }}
                                                        className="mt-4 text-white hover:bg-red-400 text-sm cursor-pointer bg-red-500 py-2 px-3 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setCheckedIn(false)}
                                            variant="outline"
                                            className="border cursor-pointer hover:text-black border-green-500 text-green-500 hover:bg-green-500/10 flex items-center py-2 px-4 rounded-lg bg-white gap-2"
                                        >
                                            <LogOut className="size-4" />
                                            Check Out
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    {userStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02 }}>
                                <div className="bg-zinc-900 border-zinc-800 rounded-2xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Icon className={`size-8 ${stat.color}`} />
                                        </div>
                                        <div className="text-zinc-400 mb-1">{stat.title}</div>
                                        <div className="text-white mb-2">{stat.value}</div>
                                        <div className="text-zinc-500 mb-3">{stat.change}</div>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-zinc-800 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.progress}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className={`h-2 rounded-full bg-linear-to-r ${stat.color === 'text-blue-500' ? 'from-blue-500 to-blue-600' :
                                                    stat.color === 'text-green-500' ? 'from-green-500 to-green-600' :
                                                        'from-yellow-500 to-yellow-600'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    {/* Membership Status */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-zinc-900 border-zinc-800 h-full rounded-2xl p-6">
                            <div className='mb-8'>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-white">Membership & Payments</h2>
                                    <span className="bg-green-500/10 text-green-500 px-2 rounded-lg py-1 text-xs hover:bg-green-500/20">
                                        {membershipInfo.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                                            <DollarSign className="size-5 text-red-500" />
                                            <div>
                                                <div className="text-zinc-400">Current Plan</div>
                                                <div className="text-white">{membershipInfo.plan} - {membershipInfo.amount}/month</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                                            <Calendar className="size-5 text-red-500" />
                                            <div>
                                                <div className="text-zinc-400">Member Since</div>
                                                <div className="text-white">{membershipInfo.startDate}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                                            <Clock className="size-5 text-red-500" />
                                            <div>
                                                <div className="text-zinc-400">Next Payment</div>
                                                <div className="text-white">{membershipInfo.nextPayment}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                                            <Activity className="size-5 text-red-500" />
                                            <div>
                                                <div className="text-zinc-400">Days Until Renewal</div>
                                                <div className="text-white">{membershipInfo.daysLeft} days</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-800 pt-6 mb-6">
                                    <h4 className="text-white mb-4">Recent Payments</h4>
                                    <div className="space-y-3">
                                        {paymentHistory.map((payment, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                                        <CheckCircle2 className="size-5 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white">{payment.date}</div>
                                                        <div className="text-zinc-400">{payment.plan}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white mb-1">{payment.amount}</div>
                                                    <span className="bg-green-500/10 px-2 rounded-lg text-xs py-0.5 text-green-500 hover:bg-green-500/20">
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-red-500 hover:bg-red-600 py-1 text-white rounded-lg cursor-pointer">
                                        Upgrade Plan
                                    </button>
                                    <button
                                        variant="outline"
                                        className="border-zinc-700 py-1 border cursor-pointer bg-zinc-700 rounded-lg text-white hover:bg-zinc-800"
                                    >
                                        View All Payments
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Personal Trainer */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 h-full rounded-2xl p-6">
                            <div>
                                <h2 className="text-white">My Trainer</h2>
                            </div>
                            <div>
                                <div className="flex flex-col items-center text-center mb-4">
                                    <div className="size-24 rounded-full overflow-hidden mb-4 border-2 border-red-500">
                                        <img
                                            src={personalTrainer.image}
                                            alt={personalTrainer.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-white mb-1">{personalTrainer.name}</h3>
                                    <p className="text-zinc-400 mb-2">{personalTrainer.specialization}</p>
                                    <span className="bg-red-500/10 rounded-lg px-3 py-1 text-xs text-red-500">
                                        {personalTrainer.experience} experience
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                                        <div className="text-zinc-400 mb-1">Next Session</div>
                                        <div className="text-white">{personalTrainer.nextSession}</div>
                                    </div>
                                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                                        <div className="text-zinc-400 mb-1">Sessions Remaining</div>
                                        <div className="text-white">{personalTrainer.sessionsLeft} sessions</div>
                                    </div>
                                </div>
                                <button className="w-full px-4 py-2 cursor-pointer rounded-lg mt-4 bg-zinc-800 hover:bg-zinc-700 text-white">
                                    Schedule Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Second Row */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Weekly Workout Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
                            <div className='mb-4'>
                                <h2 className="text-white">Weekly Workout Plan</h2>
                            </div>
                            <div>
                                <div className="space-y-3">
                                    {workoutPlan.map((workout, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                                    <Dumbbell className="size-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <div className="text-white mb-1">{workout.day}</div>
                                                    <div className="text-zinc-400">{workout.focus}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white mb-1">{workout.exercises} exercises</div>
                                                <div className="text-zinc-400">{workout.duration}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg cursor-pointer">
                                    View Full Plan
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Body Measurements & Achievements */}
                    <div className="space-y-6">
                        {/* Body Measurements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
                                <div className="mb-4">
                                    <h2 className="text-white">Body Measurements</h2>
                                </div>

                                <div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-3 bg-zinc-800/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Scale className="size-4 text-red-500" />
                                                <span className="text-zinc-400">Weight</span>
                                            </div>
                                            <div className="text-white">{bodyMeasurements.weight}</div>
                                        </div>

                                        <div className="p-3 bg-zinc-800/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Ruler className="size-4 text-red-500" />
                                                <span className="text-zinc-400">Height (cm)</span>
                                            </div>
                                            <div className="text-white">{bodyMeasurements.height}</div>
                                        </div>

                                        <div className="p-3 bg-zinc-800/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart3 className="size-4 text-red-500" />
                                                <span className="text-zinc-400">BMI</span>
                                            </div>
                                            <div className="text-white">{bmiValue || bodyMeasurements.bmi}</div>
                                        </div>

                                        <div className="p-3 bg-zinc-800/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="size-4 text-red-500" />
                                                <span className="text-zinc-400">Body Fat</span>
                                            </div>
                                            <div className="text-white">{bodyMeasurements.bodyFat}</div>
                                        </div>
                                    </div>

                                    {showBar && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6"
                                        >
                                            <div className="text-white font-semibold mb-2">
                                                BMI: {bmiValue} ({bmiCategory})
                                            </div>

                                            <div className="relative h-3 w-full rounded-full overflow-hidden bg-zinc-700">
                                                {/* Zones */}
                                                <div className="absolute left-0 top-0 h-full bg-blue-600" style={{ width: "25%" }}></div>
                                                <div className="absolute left-[25%] top-0 h-full bg-green-600" style={{ width: "25%" }}></div>
                                                <div className="absolute left-[50%] top-0 h-full bg-yellow-500" style={{ width: "25%" }}></div>
                                                <div className="absolute left-[75%] top-0 h-full bg-red-600" style={{ width: "25%" }}></div>

                                                {/* Indicator */}
                                                <motion.div
                                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                                                    animate={{ left: getIndicatorPosition() }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="text-zinc-500 mb-3">Last updated: {bodyMeasurements.lastUpdated}</div>

                                    <div className='flex items-center gap-4'>
                                        <button
                                            onClick={calculateBMI}
                                            className="w-full bg-red-600 hover:bg-red-500 text-white rounded-lg py-2 cursor-pointer"
                                        >
                                            Calculate BMI
                                        </button>

                                        <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 cursor-pointer">
                                            Update Measurements
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid lg:grid-cols-1 gap-6">
                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
                            <div className='mb-6'>
                                <h2 className="text-white">Notifications</h2>
                            </div>
                            <div>
                                <div className="space-y-3">
                                    {notifications.map((notification, index) => {
                                        const Icon = notification.icon;
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg"
                                            >
                                                <div className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500/10' :
                                                    notification.type === 'warning' ? 'bg-yellow-500/10' :
                                                        'bg-blue-500/10'
                                                    }`}>
                                                    <Icon className={`size-5 ${notification.type === 'success' ? 'text-green-500' :
                                                        notification.type === 'warning' ? 'text-yellow-500' :
                                                            'text-blue-500'
                                                        }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-white mb-1">{notification.title}</div>
                                                    <div className="text-zinc-400 mb-1">{notification.message}</div>
                                                    <div className="text-zinc-500">{notification.time} ago</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
