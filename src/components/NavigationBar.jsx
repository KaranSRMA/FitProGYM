import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Home, LayoutDashboard, Users, CreditCard, Menu, X, Bell, Loader } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { div } from 'motion/react-client';


export function NavigationBar() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [readButtonDisabled, setreadButtonDisabled] = useState(false);
    const notificationRef = useRef(null);
    const socketRef = useRef(null);
    const retryCountRef = useRef(0);
    const SOCKET_API = import.meta.env.VITE_WEBSOCKET_API;
    const REST_API = import.meta.env.VITE_REST_API;

    const queryClient = useQueryClient();



    const fetchNotifications = async ({ pageParam = 1 }) => {
        try {
            const { data } = await axios.get(
                `${REST_API}/notifications?page=${pageParam}`,
                { withCredentials: true }
            );
            return data; // Ensure your backend returns the current page and total pages/hasMore
        } catch (err) {
            throw new Error(err?.response?.data?.detail || "Failed to fetch");
        }
    }

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { path: '/trainers', label: 'Trainers', icon: Users },
        { path: '/memberships', label: 'Memberships', icon: CreditCard },
    ]

    // checking which navlink is active 
    const isActive = (path) => location.pathname === path;
    const { loggedIn, role, user_id, is_active } = useSelector(state => state.auth);

    // Click outside to close notification panel
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['notifications-history', user_id],
        queryFn: fetchNotifications,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        enabled: !!loggedIn && !!user_id && role === 'member',
        staleTime: 1000 * 60 * 5
    });


    const displayedNotifications = useMemo(() => {
        return data?.pages?.flatMap(page => page.notifications) ?? [];
    }, [data]);

    const unreadCount = displayedNotifications.filter(n => !n.is_read).length;

    const markAllAsRead = async () => {
        setreadButtonDisabled(true);
        const notificationIds = displayedNotifications.filter(n => !n.is_read).map(n => n.id);

        try {
            const res = await axios.patch(`${REST_API}/notifications/read`, {
                notification_ids: notificationIds
            }, { withCredentials: true });

            if (res?.status === 200) {
                queryClient.setQueryData(['notifications-history', user_id], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            notifications: page.notifications.map(n => ({ ...n, is_read: true }))
                        }))
                    };
                });
                toast.success(res?.data?.message)
            } else {
                toast.error("Unexpected response status!");
            }
        } catch {
            toast.error("Failed to update notifications");
        } finally {
            setreadButtonDisabled(false);
        }
    };

    const markAsRead = async (id) => {
        if (unreadCount <= 0) return;
        try {
            const res = await axios.patch(`${REST_API}/notifications/read`, {
                notification_ids: [id]
            }, { withCredentials: true });

            if (res?.status === 200) {
                queryClient.setQueryData(['notifications-history', user_id], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            notifications: page.notifications.map(n =>
                                n.id === id ? { ...n, is_read: true } : n
                            )
                        }))
                    };
                });
            }
        } catch {
            toast.error("Failed to update notifications");
        }
    }

    // websocket connection logic -----------------------------------------------
    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `${SOCKET_API}/notifications/${user_id}/${role}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            retryCountRef.current = 0;
            toast.success("Connected to server...");
        };

        ws.onmessage = (event) => {
            try {
                const newNotification = JSON.parse(event?.data);

                queryClient.setQueryData(['notifications-history', user_id], (oldData) => {
                    if (!oldData) return oldData;
                    return { ...oldData, pages: oldData.pages.map((page, index) => index === 0 ? { ...page, notifications: [newNotification, ...page.notifications] } : page) };
                });
            } catch {
                toast.error("Failed to parse socket message");
            }
        };

        ws.onclose = (event) => {
            if (event.wasClean) return;

            toast.error("Disconnected...");

            const backoff = Math.min(30000, Math.pow(2, retryCountRef.current) * 1000);
            const jitter = Math.random() * 1000;
            const delay = backoff + jitter;

            if (retryCountRef.current < 10) {
                toast.info(`Reconnecting in ${Math.round(delay / 1000)} seconds...`);
                setTimeout(() => {
                    retryCountRef.current++;
                    connect();
                }, delay);
            } else {
                toast.error("Connection failed after 10 attempts. Please refresh.");
            }
        };

        ws.onerror = () => {
            ws.close();
        };

        socketRef.current = ws;
    }, [user_id, role, SOCKET_API, queryClient]);

    useEffect(() => {
        const shouldConnect = loggedIn && is_active && role === 'member';

        if (shouldConnect) {
            connect();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [connect, loggedIn, is_active, role]);

    return (
        <nav className='sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800'>
            <div className='flex items-center justify-between px-4 sm:px-6 lg:px-16 py-3'>
                {/* Left side - Brand Name */}
                <div>
                    {/* Brand icon */}
                    <Link to='/' onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }} >
                            <Dumbbell className='text-red-500 size-8' />
                        </motion.div>
                        <span className="text-white ">FitPro Gym</span>
                    </Link>
                </div>

                {/* Right side nav links  */}
                {/* Desktop navigation */}
                <div className='flex items-center gap-10'>
                    {/* Notification Bell */}
                    {loggedIn && (
                        <div className='relative' ref={notificationRef}>
                            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className='cursor-pointer mt-2 relative'>
                                <Bell className='text-white hover:text-red-500' />
                                {unreadCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                                    >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </motion.span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 w-100 mt-4 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden"
                                    >
                                        <div className="p-3 flex justify-between items-center border-b border-zinc-800">
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button disabled={readButtonDisabled} onClick={markAllAsRead} className="cursor-pointer text-xs text-red-500 hover:text-red-400 transition-colors disabled:cursor-not-allowed disabled:text-zinc-500">
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {displayedNotifications.length > 0 ? (
                                                <div>
                                                    <div>
                                                        {displayedNotifications.map(notification => (
                                                            <div onClick={() => !notification.is_read && markAsRead(notification.id)} key={notification.id} className={`p-3 border-b border-zinc-800 flex items-start gap-3 transition-colors ${!notification.is_read ? 'bg-red-500/5' : ''}`}>
                                                                {!notification.is_read && <div className="mt-1.5 size-2 rounded-full bg-red-500 shrink-0"></div>}
                                                                <div className={notification.is_read ? 'pl-5' : ''}>
                                                                    <p className="text-sm text-zinc-300">{notification.message}</p>
                                                                    <p className="text-xs text-zinc-500 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {hasNextPage && (
                                                        <div className='flex items-center justify-center my-3'>
                                                            <button onClick={() => fetchNextPage()} className='text-sm text-blue-500 cursor-pointer px-3'>{isFetchingNextPage ? <Loader className='size-4 animate-spin text-red-500 mx-auto' /> : "Load More"}</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-zinc-500 text-sm">
                                                    You're all caught up!
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className='hidden md:flex items-center justify-center gap-5'>
                        {navLinks.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path)
                            return (
                                <Link key={item.path} to={item.path} className='relative px-3 py-2'>
                                    <motion.div
                                        className='flex items-center gap-2'
                                        whileHover={{ y: -2 }}
                                        transition={{ duration: 0.2 }}>
                                        <Icon className={`${active ? 'text-red-500' : 'text-zinc-400'} size-4`} />
                                        <span className={`${active ? 'text-white' : 'text-zinc-400'}`}>{item.label}</span>
                                    </motion.div>
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}

                                </Link>
                            )
                        })}
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='md:hidden text-white'>
                        {mobileMenuOpen ? <X className='size-6' /> : <Menu className='size-6' />}
                    </button>
                </div>
            </div>

            {/* Mobile navigation  */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-zinc-800 bg-zinc-900"
                    >
                        <div className='px-4 py-2 space-y-1'>
                            {navLinks.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.path)
                                return (
                                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg ${active ? 'bg-red-500/10 text-white' : 'text-zinc-400'
                                        }`}>
                                        <Icon className={`${active ? 'text-red-500' : 'text-zinc-400'} size-5`} />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
