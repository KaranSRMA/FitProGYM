import { useState, useEffect, cloneElement, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Mail, Phone, CreditCard,
    ChevronRight, Loader, X, MapPin, Target, Dumbbell,
    User, Clock, History, Wallet, UserCheck, LogIn, BicepsFlexed, ShieldMinus, Ban
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router';

const REST_API = import.meta.env.VITE_REST_API;

const fetchUsers = async (page) => {
    try {
        const { data } = await axios.get(`${REST_API}/users?page=${page}&limit=50`, {
            withCredentials: true,
        });
        return data;
    } catch (err) {
        const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to fetch users';
        throw new Error(message);
    }
};

export function MembersManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setcurrentPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState(null);
    const [dbSearchQuery, setDbSearchQuery] = useState('');
    const [dbSearchResults, setDbSearchResults] = useState(null);
    const [dbSearchLoading, setDbSearchLoading] = useState(false);

    const [processingId, setProcessingId] = useState(null);

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const performDbSearch = async (query) => {
        if (!query || !query.trim()) {
            toast.error('Please enter a search term');
            return;
        }
        setDbSearchLoading(true);
        try {
            const { data: res, status } = await axios.get(`${REST_API}/user?search=${encodeURIComponent(query)}`, {
                withCredentials: true,
            });
            if (status === 200) {
                const user = res?.user ?? [];
                setDbSearchResults(user);
            } else{
                toast.error("Unexpected response from server")
            }
        } catch (err) {
            let message = 'Search failed';
            const response = err.response?.data;
            const detail = response?.detail ?? response?.message;
            if (Array.isArray(detail) && detail.length) {
                message = detail[0].msg || detail[0].message || JSON.stringify(detail[0]);
            } else if (typeof detail === 'string') {
                message = detail;
            }
            toast.error(message);
        } finally {
            setDbSearchLoading(false);
        }
    };

    const { data, error, isLoading, isError } = useQuery({
        queryKey: ['users', currentPage],
        queryFn: () => fetchUsers(currentPage),
        placeholderData: (previousData) => previousData,
        staleTime: 30000,
    });

    useEffect(() => {
        if (isError) {
            const msg = error?.response?.data?.detail || 'Failed to fetch members';
            toast.error(msg);
            if (/unauthorized|401/i.test(msg)) {
                navigate('/login', { replace: true });
            }
        }
    }, [isError, error, navigate]);

    const displayedMembers = useMemo(() => {
        if (dbSearchResults) return dbSearchResults;

        const members = data?.users ?? [];
        return members.filter(member => {
            const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'active' ? member.is_active === true : member.is_active === false);

            return matchesSearch && matchesFilter;
        });
    }, [data, searchQuery, filterStatus, dbSearchResults]);


    const totalUsers = dbSearchResults ? 1 : data?.total_users;
    const getStatusColor = (status) => status ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-500';

    const totalPages = Math.max(1, Math.ceil((totalUsers ?? 0) / 50));
    const maxPagesToShow = 6;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), Math.max(1, totalPages - maxPagesToShow + 1)));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const handleBlock = async (userID) => {
        setProcessingId(userID);
        try {
            const { data: blockRes, status } = await axios.patch(`${REST_API}/blockUnblock?user_id=${encodeURIComponent(userID)}`, {}, { withCredentials: true });
            if (status === 200) {
                toast.success(blockRes?.message || "Status Updated");

                queryClient.setQueryData(['users', currentPage], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        users: oldData.users.map(u => u.user_id === userID ? { ...u, is_active: !u.is_active } : u)
                    };
                });

                if (dbSearchResults) {
                    setDbSearchResults(prev => prev.map(u => u.user_id === userID ? { ...u, is_active: !u.is_active } : u));
                }

                setSelectedMember(null);
            } else {
                toast.error("Unexpected response from server.")
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className='sticky bg-zinc-950/95 backdrop-blur-sm top-[65px] z-50 mb-2 pb-1'>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-white mb-2 text-2xl font-semibold">Members Management</h1>
                                <p className="text-zinc-400">Manage your gym members and their memberships</p>
                            </div>
                            <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                <label className="text-zinc-400 text-sm hidden sm:block">Search on Database</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={dbSearchQuery}
                                        onChange={(e) => setDbSearchQuery(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') performDbSearch(dbSearchQuery); }}
                                        placeholder="Enter userID or email..."
                                        className="pl-3 pr-10 h-10 rounded-lg border bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                    <button onClick={() => performDbSearch(dbSearchQuery)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer">
                                        {dbSearchLoading ? <Loader className="size-5 animate-spin text-red-500" /> : <Search className="size-5" />}
                                    </button>
                                </div>
                                {dbSearchResults && (
                                    <button onClick={() => { setDbSearchQuery(''); setDbSearchResults(null); }} className="text-sm px-3 py-1 rounded-lg border text-white border-zinc-700 hover:bg-zinc-800 cursor-pointer">
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full h-11 rounded-lg border bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-48 bg-zinc-900 border border-zinc-800 text-white rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {!dbSearchResults && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setcurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg border ${currentPage === 1 ? 'text-zinc-500 border-zinc-800 cursor-not-allowed' : 'text-white border-zinc-700 cursor-pointer hover:bg-zinc-800'}`}>Previous</button>
                                <div className="flex items-center gap-1">
                                    {pages.map((p) => (
                                        <button key={p} onClick={() => setcurrentPage(p)} className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${currentPage === p ? 'bg-red-500 text-white' : 'text-white bg-zinc-800 hover:bg-zinc-700'}`}>{p}</button>
                                    ))}
                                </div>
                                <button onClick={() => setcurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className={`px-3 py-1 rounded-lg border ${currentPage >= totalPages ? 'text-zinc-500 border-zinc-800 cursor-not-allowed' : 'text-white cursor-pointer border-zinc-700 hover:bg-zinc-800'}`}>Next</button>
                            </div>
                        )}
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-[calc(100vh-220px)] overflow-y-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                    <th className="sticky top-0 bg-zinc-800 z-40 text-left py-4 px-6 text-zinc-400 font-medium text-sm">Name</th>
                                    <th className="sticky top-0 bg-zinc-800 z-40 text-left py-4 px-6 text-zinc-400 font-medium text-sm">Email</th>
                                    <th className="sticky top-0 bg-zinc-800 z-40 text-left py-4 px-6 text-zinc-400 font-medium text-sm">Phone</th>
                                    <th className="sticky top-0 bg-zinc-800 z-40 text-left py-4 px-6 text-zinc-400 font-medium text-sm">Join Date</th>
                                    <th className="sticky top-0 bg-zinc-800 z-40 text-left py-4 px-6 text-zinc-400 font-medium text-sm">Status</th>
                                    <th className="sticky top-0 bg-zinc-800 z-40 text-right py-4 px-6 text-zinc-400 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(isLoading || dbSearchLoading) ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
                                            <p className="text-zinc-500 text-sm">Loading members...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence mode='popLayout' initial={false}>
                                        {displayedMembers.map((member) => (
                                            <motion.tr
                                                key={member.user_id || member.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                                            >
                                                <td className="py-4 px-6 text-white font-medium">{member.name}</td>
                                                <td className="py-4 px-6 text-zinc-400 text-sm">{member.email}</td>
                                                <td className="py-4 px-6 text-zinc-400 text-sm">{member.phone || 'N/A'}</td>
                                                <td className="py-4 px-6 text-zinc-400 text-sm">{new Date(member.created_at).toLocaleDateString()}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(member.is_active)}`}>
                                                        {member.is_active ? "active" : "inactive"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button onClick={() => setSelectedMember(member)} className="inline-flex items-center justify-center cursor-pointer size-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
                                                        <ChevronRight className="size-5" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                                {displayedMembers.length === 0 && !isLoading && !dbSearchLoading && (
                                    <tr>
                                        <td colSpan="6" className='py-20 text-center'>
                                            <p className="text-zinc-400">No members found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedMember && (
                    <MemberDetailModal
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                        blockUnblock={handleBlock}
                        isProcessing={processingId === selectedMember.user_id}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function MemberDetailModal({ member, onClose, blockUnblock, isProcessing }) {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl">
                <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md p-6 border-b border-zinc-800 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        {member.profile_photo ? (
                            <img src={member.profile_photo} alt={member.name} className="size-14 rounded-full object-cover border-2 border-red-500/20" />
                        ) : (
                            <div className="size-14 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700"><User className="size-7" /></div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{member.name}</h2>
                            <p className="text-xs text-zinc-500 font-mono mt-1">ID: {member.user_id}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => blockUnblock(member.user_id)}
                        disabled={isProcessing}
                        className={`bg-zinc-800 rounded-xl cursor-pointer px-3 py-2 text-white flex gap-1 items-center transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? (
                            <Loader className="size-4 animate-spin" />
                        ) : (
                            member.is_active ? <Ban className='text-red-500 size-4' /> : <ShieldMinus className='text-green-500 size-4' />
                        )}
                        <span>{isProcessing ? "Processing..." : (member.is_active ? "Block User" : "Unblock User")}</span>
                    </button>

                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 cursor-pointer rounded-full text-zinc-400 hover:text-white"><X className="size-6" /></button>
                </div>

                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <InfoBox icon={<Mail />} label="Email Address" value={member.email} />
                        <InfoBox icon={<Phone />} label="Phone Number" value={member.phone} />
                        <InfoBox icon={<MapPin />} label="Home Address" value={member.address} />
                        <InfoBox icon={<Target />} label="Fitness Goal" value={member.fitness_goal} />
                        <InfoBox icon={<Dumbbell />} label="Skill Level" value={member.experience_level} />
                        <InfoBox icon={<Clock />} label="Last Updated" value={new Date(member.updated_at).toLocaleString()} />
                        <InfoBox icon={<Clock />} label="Join Date" value={new Date(member.created_at).toLocaleString()} />
                        <InfoBox icon={<LogIn />} label="Last Login" value={new Date(member.last_login).toLocaleString()} />
                    </div>
                    <div className="pt-4 border-t border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><History className="size-4 text-red-500" /> Member Records</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <FuturePlaceholder icon={<BicepsFlexed />} title="Personal Trainer" desc="Personal Trainer if any." />
                            <FuturePlaceholder icon={<UserCheck />} title="Attendance History" desc="Log of gym check-ins and session duration." />
                            <FuturePlaceholder icon={<CreditCard />} title="Memberships & Plans" desc="Active subscriptions and renewal dates." />
                            <FuturePlaceholder icon={<Wallet />} title="Billing & Payments" desc="History of invoices and transaction status." />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-zinc-800/20 border-t border-zinc-800 text-center"><p className="text-[10px] text-zinc-600 uppercase tracking-widest">Gym Management System Internal Record</p></div>
            </motion.div>
        </div>
    );
}

function InfoBox({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2.5 bg-zinc-800 rounded-xl text-red-500">{cloneElement(icon, { size: 18 })}</div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">{label}</p>
                <p className="text-sm text-zinc-200 truncate">{value || 'N/A'}</p>
            </div>
        </div>
    );
}

function FuturePlaceholder({ icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 opacity-60">
            <div className="text-zinc-500">{cloneElement(icon, { size: 20 })}</div>
            <div>
                <h4 className="text-xs font-medium text-zinc-400">{title}</h4>
                <p className="text-[11px] text-zinc-600">{desc}</p>
            </div>
        </div>
    );
}