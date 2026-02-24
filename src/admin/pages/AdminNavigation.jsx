import { Link, useLocation, useNavigate } from 'react-router';
import { Dumbbell, LayoutDashboard, Users, Bell, CreditCard, DollarSign, LogOut, Menu, X, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../components/dashboard/authSlice';
import axios from 'axios';

export function AdminNavigation() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/members', label: 'Members', icon: Users },
        { path: '/admin/trainers', label: 'Trainers', icon: Users },
        { path: '/admin/notifications', label: 'Notifications', icon: Bell },
        { path: '/admin/plans', label: 'Plans', icon: CreditCard },
        { path: '/admin/payments', label: 'Payments', icon: DollarSign },
        { path: '/admin/checkins', label: 'CheckIns', icon: QrCode },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await axios.post(`${BASE_URL}/auth/logout`, null, { withCredentials: true })
            dispatch(logout())
            setTimeout(() => {
                navigate('/login')
            }, 500);
        } catch {
            // pass 
        }
    }


    return (
        <nav className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border border-zinc-800">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/admin/dashboard" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Dumbbell className="size-8 text-red-500" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-white">FitPro Admin</span>
                            <span className="text-xs text-zinc-500">Management Portal</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative px-4 py-2"
                                >
                                    <motion.div
                                        className="flex items-center gap-2"
                                        whileHover={{ y: -2 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon className={`size-4 ${active ? 'text-red-500' : 'text-zinc-400'}`} />
                                        <span className={active ? 'text-white' : 'text-zinc-400'}>
                                            {item.label}
                                        </span>
                                    </motion.div>
                                    {active && (
                                        <motion.div
                                            layoutId="activeAdminTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Auth Section */}
                        <div className="ml-4 flex items-center gap-2 pl-4 border-l border-zinc-800">
                            {/* {user && ( */}
                                <span className="text-zinc-400 text-sm">
                                    {/* {user.name} */}
                                    adminuser
                                </span>
                            {/* )} */}
                            <button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="border-zinc-700 flex items-center border px-2 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                <LogOut className="size-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-white p-2"
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-zinc-800 bg-zinc-900"
                    >
                        <div className="px-4 py-2 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-red-500/10 text-white' : 'text-zinc-400'
                                            }`}
                                    >
                                        <Icon className={`size-5 ${active ? 'text-red-500' : 'text-zinc-400'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth Section */}
                            <div className="pt-2 border-t border-zinc-800 mt-2">
                                {/* {user && ( */}
                                    <div className="px-4 py-2 text-zinc-400 text-sm">
                                        {/* {user.name} */}
                                        adminuser
                                    </div>
                                {/* )} */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 w-full hover:bg-zinc-800"
                                >
                                    <LogOut className="size-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}