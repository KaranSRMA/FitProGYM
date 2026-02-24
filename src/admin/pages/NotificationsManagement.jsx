import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Send, Bell, Users, User, MessageSquare, Trash2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';


const REST_API = import.meta.env.VITE_REST_API;

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

export function NotificationsManagement() {
    const [recipientType, setRecipientType] = useState('all');
    const [recipientID, setRecipientID] = useState(null);
    const [message, setMessage] = useState('');
    const [sendButtonActive, setsendButtonActive] = useState(false);
    const queryClient = useQueryClient();


    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteQuery({
        queryKey: ['notifications-history'],
        queryFn: fetchNotifications,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore) {
                return lastPage.page + 1;
            }
            return undefined;
        },
    });


    const handleSend = async () => {
        if (!message.trim()) {
            toast.error('Please fill in message');
            return;
        }

        if (message.trim().length > 500) {
            toast.info("Please keep messages concise when possible, though you are free to exceed 500 characters if needed for detail.")
        }

        if ((recipientType === 'member' || recipientType === 'trainer') && !recipientID) {
            toast.error('Please select a recipient ID');
            return;
        }
        setsendButtonActive(true);

        try {
            const payload = {
                message: message,
                recipient_id: recipientID,
                recipient_role: recipientType
            }
            const { data: resNotif, status } = await axios.post(`${REST_API}/sendNotification`, payload, { withCredentials: true });
            if (status === 201) {
                queryClient.invalidateQueries({ queryKey: ['notifications-history'] });
                setMessage('');
                setRecipientType('all');
                setRecipientID(null);
                toast.success(resNotif?.message || 'Notification sent successfully!');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.detail || 'Failed to send notification';
            toast.error(errorMessage)
        } finally {
            setsendButtonActive(false);
        }
    };


    useEffect(() => {
        if (isError) {
            const msg = error?.response?.data?.detail || 'Failed to fetch notifications';
            toast.error(msg);
        }
    }, [isError, error]);

    const displayedNotifications = useMemo(() => {
        return data?.pages?.flatMap(page => page.notifications) ?? [];
    }, [data])


    const getRecipientIcon = (type) => {
        switch (type) {
            case 'all':
                return <Users className="size-4" />;
            case 'allTrainers':
                return <Users className="size-4" />;
            case 'allMembers':
                return <Users className="size-4" />;
            case 'member':
                return <User className="size-4" />;
            case 'trainer':
                return <User className="size-4" />;
            default:
                return <MessageSquare className="size-4" />;
        }
    };

    const getRecipientColor = (type) => {
        switch (type) {
            case 'all':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'allTrainers':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'allMembers':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'trainer':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'member':
                return 'bg-green-500/10 text-green-300 border-green-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-white text-2xl font-bold mb-2">Notifications & Messaging</h1>
                    <p className="text-zinc-400">Send messages to members and trainers</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Send Notification Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-zinc-900 p-8 rounded-xl border-zinc-800 sticky top-20">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Bell className="size-5 text-red-500" />
                                    <h2 className="text-white font-bold">Send Notification</h2>
                                </div>
                                <p className="text-zinc-400">
                                    Create and send messages
                                </p>
                            </div>
                            <div className="space-y-4 mt-5">
                                {/* Recipient Type */}
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-zinc-300">Recipient Type</label>
                                    <select
                                        value={recipientType}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setRecipientType(value);
                                        }}
                                        className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Members & Trainers</option>
                                        <option value="allTrainers">All Trainers</option>
                                        <option value="allMembers">All Members</option>
                                        <option value="member">One Member</option>
                                        <option value="trainer">One Trainer</option>
                                    </select>
                                </div>

                                {(recipientType === 'trainer' || recipientType === 'member') && (
                                    <div className='space-y-2 flex flex-col'>
                                        <label className="text-zinc-300">Recipient ID</label>
                                        <input type='text'
                                            placeholder='Enter recipient ID'
                                            value={recipientID}
                                            onChange={(e) => setRecipientID(e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 text-white border rounded p-2 placeholder:text-zinc-500" />
                                    </div>
                                )}


                                {/* Message */}
                                <div className="space-y-2 flex flex-col">
                                    <label htmlFor="message" className="text-zinc-300 font-bold">Message</label>
                                    <textarea
                                        id="message"
                                        placeholder="Enter your message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={6}
                                        className="bg-zinc-800 border-zinc-700 text-white border rounded p-2 placeholder:text-zinc-500 resize-none"
                                    />
                                </div>

                                {/* Send Button */}
                                <button
                                    onClick={handleSend}
                                    disabled={sendButtonActive}
                                    className="w-full flex items-center disabled:cursor-not-allowed justify-center gap-2 py-2 rounded-md cursor-pointer bg-red-500 hover:bg-red-600 text-white"
                                >
                                    {sendButtonActive ? (<Loader className="size-6 animate-spin" />
                                    ) : (<>
                                        <Send className="size-4 mr-2" />
                                        Send Notification
                                    </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notification History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >

                        <div className="bg-zinc-900 p-8 rounded-2xl border-zinc-800">
                            <div className='mb-4'>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-white font-bold">Notification History</h2>
                                        <p className="text-zinc-400">
                                            Previously sent messages
                                        </p>
                                    </div>
                                    <span className="bg-red-500/10 text-red-500 border px-2 rounded-full border-red-500/20">
                                        {displayedNotifications.length} sent
                                    </span>
                                </div>
                            </div>
                            {isLoading ? (
                                <div>
                                    <div className="py-20 text-center">
                                        <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="space-y-3">
                                        {displayedNotifications.length === 0 ? (
                                            <div className="text-center py-12">
                                                <MessageSquare className="size-12 text-zinc-700 mx-auto mb-4" />
                                                <p className="text-zinc-500">
                                                    No notifications sent yet
                                                </p>
                                            </div>
                                        ) : (
                                            displayedNotifications.map((notification, index) => (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`flex items-center gap-2 px-3 rounded-full py-1 ${getRecipientColor(notification.recipient_role)}`}>
                                                                {getRecipientIcon(notification.recipient_role)}
                                                                <span className="ml-1">{notification.recipient_id ? notification.recipient_id : notification.recipient_role}</span>
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    {displayedNotifications.length > 0 && (
                                        <div className='flex items-center justify-center mt-5'>
                                            {hasNextPage ? (
                                                <button onClick={() => fetchNextPage()} className='text-sm text-blue-500 cursor-pointer px-3'>{isFetchingNextPage ? <Loader className='size-4 animate-spin text-red-500 mx-auto' /> : "Load More"}</button>
                                            ) : (
                                                displayedNotifications.length > 0 && (
                                                    <p className="text-zinc-600 text-xs text-center py-4">
                                                        You've reached the end of your notifications.
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
