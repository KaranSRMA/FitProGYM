import { useCallback } from 'react';
import { motion } from 'motion/react';
import { QrCode, Users, Clock, Calendar, RefreshCw, CheckCircle2, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { toast } from 'sonner';


export function CheckInManagement() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [todayCount, setTodayCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    const REST_API = import.meta.env.VITE_REST_API;



    const fetchNewToken = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${REST_API}/generateQrToken`, {}, { withCredentials: true });
            if (response.status === 201) {
                setToken(response?.data?.token);
                setTodayCount(response?.data?.today_checkins);
            }
        } catch (err) {
            toast.error("Error generating QR ", err);
        } finally {
            setLoading(false);
        }
    }, [REST_API]);


    useEffect(() => {
        fetchNewToken();

        const interval = setInterval(() => {
            fetchNewToken();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchNewToken]);

    const qrCodeUrl = token;
    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRefreshQR = () => {
        fetchNewToken();
    };


    const stats = [
        { title: "Today's Check-ins", value: todayCount, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { title: 'Current Time', value: currentTime.toLocaleTimeString(), icon: Clock, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        {
            title: 'Current Date', value: currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'), icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-500/10'
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-white mb-2 font-bold text-2xl">QR Code Check-In</h1>
                    <p className="text-zinc-400">Display QR code for members to scan and check in</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="bg-zinc-900 border-zinc-800 border rounded-2xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                                <Icon className={`size-6 ${stat.color}`} />
                                            </div>
                                        </div>
                                        <p className="text-zinc-400 text-sm mb-1">{stat.title}</p>
                                        <h2 className="text-white">{stat.value}</h2>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* QR Code Display */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 border p-6 rounded-2xl">
                            <div>
                                <h2 className="text-white flex items-center gap-2">
                                    <QrCode className="size-6 text-red-500" />
                                    Check-In QR Code
                                </h2>
                                <p className="text-zinc-400">
                                    Members can scan this QR code to check in
                                </p>
                            </div>
                            <div>
                                {loading ? (
                                    <div>
                                        <div className="py-20 text-center">
                                            <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center pt-8">
                                        {/* QR Code */}
                                        <div className="bg-white p-6 rounded-lg mb-6">
                                            <QRCode
                                                value={qrCodeUrl}
                                                size={280}
                                                level="H"
                                                fgColor="#000000"
                                                bgColor="#ffffff"
                                            />
                                        </div>
                                        {/* Refresh Button */}
                                        <button
                                            onClick={handleRefreshQR}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white cursor-pointer flex items-center justify-center gap-4 py-2 rounded-lg"
                                        >
                                            <RefreshCw className="size-4 mr-2" />
                                            Generate New QR Code
                                        </button>

                                        <p className="text-zinc-500 text-xs mt-4 text-center">
                                            QR code refreshes automatically for security. Members can also check in manually using their Member email.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 border p-6 rounded-2xl">
                            <div>
                                <h2 className="text-white">How It Works</h2>
                                <p className="text-zinc-400">
                                    Instructions for member check-in
                                </p>
                            </div>
                            <div className='pt-4'>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-500/10 text-red-500 rounded-full size-8 flex items-center justify-center shrink-0 mt-1">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="text-white mb-1">Display QR Code</h4>
                                            <p className="text-zinc-400 text-sm">
                                                Keep this QR code visible at the gym entrance on a tablet or monitor for easy scanning.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-500/10 text-red-500 rounded-full size-8 flex items-center justify-center shrink-0 mt-1">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="text-white mb-1">Member Scans</h4>
                                            <p className="text-zinc-400 text-sm">
                                                Members use their phone to scan the code when they arrive.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-500/10 text-red-500 rounded-full size-8 flex items-center justify-center shrink-0 mt-1">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="text-white mb-1">Enter Member ID</h4>
                                            <p className="text-zinc-400 text-sm">
                                                After scanning, members enter their unique Member ID to complete the check-in process.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-500/10 text-red-500 rounded-full size-8 flex items-center justify-center shrink-0 mt-1">
                                            4
                                        </div>
                                        <div>
                                            <h4 className="text-white mb-1">Confirmation</h4>
                                            <p className="text-zinc-400 text-sm">
                                                The system records the check-in and displays a success message. View all check-ins below.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="text-white text-sm mb-1">Security Note</h5>
                                            <p className="text-zinc-400 text-xs">
                                                For added security, generate a new QR code periodically using the refresh button above. This helps prevent unauthorized access.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
