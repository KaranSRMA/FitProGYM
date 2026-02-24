import { useState, useEffect, useMemo, cloneElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Mail, Phone, Award, Loader, ChevronRight, CreditCard, X, MapPin, Target, Dumbbell,
    User, Clock, History, Wallet, UserCheck, LogIn, BicepsFlexed, ShieldMinus, Ban, Gem, IndianRupee,
    Badge,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';


const REST_API = import.meta.env.VITE_REST_API;

const fetchTrainers = async (page) => {
    try {
        const { data } = await axios.get(`${REST_API}/trainers?page=${page}&limit=50`, {
            withCredentials: true,
        });
        return data;
    } catch (err) {
        const message = err.response?.data?.detail || 'Failed to fetch trainers';
        throw new Error(message);
    }
};


export function TrainersManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setcurrentPage] = useState(1);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAddLoading, setisAddLoading] = useState(false);
    const [dbSearchLoading, setDbSearchLoading] = useState(false);
    const [selectedTrainers, setSelectedTrainers] = useState(null);
    const [dbSearchResults, setDbSearchResults] = useState(null);
    const [dbSearchQuery, setDbSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specializations: '',
        experience: '',
        address: '',
        shortBio: '',
        certifications: ''
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const performDbSearch = async (query) => {
        if (!query || !query.trim()) {
            toast.error('Please enter a search term');
            return;
        }
        setDbSearchLoading(true);
        try {
            const { data: res, status } = await axios.get(`${REST_API}/trainer?search=${encodeURIComponent(query)}`, {
                withCredentials: true,
            });
            if (status === 200) {
                const trainer = res?.trainer ?? [];
                setDbSearchResults(trainer);
            } else {
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
        queryKey: ['trainers', currentPage],
        queryFn: () => fetchTrainers(currentPage),
        placeholderData: (previousData) => previousData,
        staleTime: 30000,
    });

    useEffect(() => {
        if (isError) {
            const msg = error?.response?.data?.detail || 'Failed to fetch trainers';
            toast.error(msg);
            if (/unauthorized|401/i.test(msg)) {
                navigate('/login', { replace: true });
            }
        }
    }, [isError, error, navigate]);

    const displayedTrainers = useMemo(() => {
        if (dbSearchResults) return dbSearchResults;

        const trainers = data?.trainers ?? [];
        return trainers.filter(trainer => {
            const matchesSearch = trainer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trainer.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'active' ? trainer.is_active === true : trainer.is_active === false);

            return matchesSearch && matchesFilter;
        });
    }, [data, searchQuery, dbSearchResults, filterStatus]);

    const totalTrainers = dbSearchResults ? 1 : data?.trainer_count;


    const totalPages = Math.max(1, Math.ceil((totalTrainers ?? 0) / 50));
    const maxPagesToShow = 6;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), Math.max(1, totalPages - maxPagesToShow + 1)));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const handleBlock = async (trainerID) => {
        setProcessingId(trainerID);
        try {
            const { data: blockRes, status } = await axios.patch(`${REST_API}/trainer/toggleBlock?trainer_id=${encodeURIComponent(trainerID)}`, {}, { withCredentials: true });
            if (status === 200) {
                toast.success(blockRes?.message || "Status Updated");

                queryClient.setQueryData(['trainers', currentPage], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        trainers: oldData.trainers.map(u => u.trainer_id === trainerID ? { ...u, is_active: !u.is_active } : u)
                    };
                });

                if (dbSearchResults) {
                    setDbSearchResults(prev => prev.map(u => u.user_id === trainerID ? { ...u, is_active: !u.is_active } : u));
                }

                setSelectedTrainers(null);
            } else {
                toast.error("Unexpected response from server");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            specializations: '',
            experience: '',
            address: '',
            shortBio: '',
            certifications: ''
        });
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone) => {
        const phoneRegex = /^(?:(?:\+91|0)?)[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    };

    const handleAddTrainer = async () => {
        if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim() ||
            !formData.specializations?.trim() || !formData.experience ||
            !formData.address?.trim() || !formData.shortBio?.trim() || !formData.certifications?.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.name.trim().length > 255) {
            toast.error('Name should be under 255 characters!');
            return;
        }

        if (!isValidEmail(formData.email.trim())) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (!isValidPhone(formData.phone.trim())) {
            toast.error('Please enter a valid phone number.');
            return;
        }

        if (Number(formData.experience) > 30 || Number(formData.experience) < 1) {
            toast.error('Experience must be between 1 and 30 years');
            return;
        }

        const addressLen = formData.address.trim().length;
        if (addressLen < 10 || addressLen > 500) {
            toast.error("Address must be between 10 and 500 characters.");
            return;
        }

        const bioLen = formData.shortBio.trim().length;
        if (bioLen < 5 || bioLen > 100) {
            toast.error("Bio should be between 5 and 100 characters.");
            return;
        }

        const specializations = formData.specializations.split(',').map(item => item.trim()).filter(item => item !== "");
        const certifications = formData.certifications.split(',').map(item => item.trim()).filter(item => item !== "");

        if (specializations.length > 3) {
            toast.error("Specializations can be up to 3");
            return;
        }

        if (certifications.length > 3) {
            toast.error('Certifications can be up to 3');
            return;
        }

        const generatedPassword = Math.random().toString(36).slice(2, 11);

        try {
            setisAddLoading(true);
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                specializations: specializations,
                short_bio: formData.shortBio.trim(),
                experience_years: Number(formData.experience),
                certifications: certifications,
                password: generatedPassword
            };

            const { data: resTrainer, status } = await axios.post(`${REST_API}/register/trainers`, payload, { withCredentials: true });

            if (status === 201) {
                const trainerForUI = {
                    ...payload,
                    id: resTrainer.id,
                    trainer_id: resTrainer.trainer_id,
                    is_active: resTrainer.is_active,
                    created_at: resTrainer.created_at,
                    updated_at: resTrainer.updated_at
                };

                queryClient.setQueryData(['trainers', currentPage], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        trainers: [trainerForUI, ...oldData.trainers]
                    };
                });
                setisAddLoading(false);
                setIsAddDialogOpen(false);
                resetForm();
                toast.success(`Registered! Temp Password: ${generatedPassword}`, { autoClose: 10000 });
            } else {
                toast.error("Unexpected response from server")
            }
        } catch (error) {
            let message = "Registration failed. Please try again later!";
            const apiError = error.response?.data?.detail;

            if (typeof apiError === 'string') {
                message = apiError;
            } else if (Array.isArray(apiError)) {
                message = apiError.map(err => err.msg).join(", ");
            }
            toast.error(message);
        } finally {
            setisAddLoading(false);
        }
    };



    const openAddDialog = () => {
        resetForm();
        setIsAddDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className='sticky bg-zinc-950/95 backdrop-blur-sm top-[65px] z-50'>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">Trainers Management</h1>
                                <p className="text-zinc-400">Manage your gym trainers and their details</p>
                            </div>
                            <button onClick={openAddDialog} className="bg-red-500 hover:bg-red-600 text-white px-3 rounded-xl py-2 gap-3 flex items-center cursor-pointer">
                                <Plus className="size-4" />
                                Add Trainer
                            </button>
                        </div>
                    </motion.div>

                    {/* Search Bar */}
                    <div className='flex items-baseline gap-2 justify-between'>
                        <div className='flex items-baseline gap-5'>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-6"
                            >
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search trainers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-zinc-900 border-zinc-800 w-full h-11 rounded-lg border text-white placeholder:text-zinc-500"
                                    />
                                </div>
                            </motion.div>

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
                </div>

                {/* Trainers Grid */}
                {(isLoading || dbSearchLoading) ? (
                    <div>
                        <div className="py-20 text-center">
                            <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">Loading Trainers...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {displayedTrainers.map((trainer, index) => (
                                <motion.div
                                    key={trainer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="bg-zinc-900 rounded-xl p-6 border-zinc-800 hover:border-zinc-700 transition-colors">
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-red-500/10 p-3 rounded-full">
                                                        <User className="size-6 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-white">{trainer.name}</h2>
                                                        <p className="text-zinc-400">{trainer.specializations.join(', ')}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${trainer.is_active === true
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-zinc-500/10 text-zinc-500'
                                                    }`}>
                                                    {trainer.is_active ? "active" : "inactive"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='mt-8'>
                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Mail className="size-4" />
                                                    <span>{trainer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Phone className="size-4" />
                                                    <span>{trainer.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Award className="size-4" />
                                                    <span>{trainer.experience_years} years experience</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    size="sm"
                                                    className="flex-1 cursor-pointer items-center flex gap-2 justify-center border py-1.5 rounded-lg border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                                >
                                                    <IndianRupee className="size-4 mr-2" />
                                                    Pay salary
                                                </button>
                                                <button
                                                    onClick={() => setSelectedTrainers(trainer)}
                                                    className="border cursor-pointer border-zinc-700 text-white hover:bg-zinc-800 px-3 py-3 rounded-full"
                                                >
                                                    <ChevronRight className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>)}

                {displayedTrainers.length === 0 && !isLoading && !dbSearchLoading && (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">No trainers found</p>
                    </div>
                )}

                {/* Add Trainer Modal */}
                <AnimatePresence>
                    {isAddDialogOpen && (
                        <Modal onClose={() => { setIsAddDialogOpen(false); resetForm(); }}>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg text-white font-semibold">Add New Trainer</h3>
                                        <p className="text-zinc-400 text-sm">Fill in the trainer details below</p>
                                    </div>
                                    <button onClick={() => { setIsAddDialogOpen(false); resetForm(); }} className="p-2 rounded-full text-zinc-400 hover:text-white">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="text-zinc-300">Full Name</label>
                                        <input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="text-zinc-300">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="john@fitpro.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="text-zinc-300">Phone</label>
                                        <input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="+91-8989898989"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="specializations" className="text-zinc-300">Specializations *</label>
                                        <input
                                            id="specializations"
                                            value={formData.specializations}
                                            onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="Strength Training (enter comma(,) seperated value)"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="experience" className="text-zinc-300">Experience in years</label>
                                        <input
                                            id="experience"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="5 years"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="text-zinc-300">Address</label>
                                        <input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="Block D, UK, India"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="shortbio" className="text-zinc-300">Short Bio</label>
                                        <input
                                            id="shortbio"
                                            value={formData.shortBio}
                                            onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="I am specialize in strength training."
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="certifications" className="text-zinc-300">Short Bio</label>
                                        <input
                                            id="certifications"
                                            value={formData.certifications}
                                            onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                            className="bg-zinc-800 border border-zinc-700 text-white w-full rounded px-3 py-2"
                                            placeholder="CSCS, NASM-CPT"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setIsAddDialogOpen(false); resetForm(); }} disabled={isAddLoading} className={`border border-zinc-700 text-zinc-300 px-3 py-1 rounded ${isAddLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleAddTrainer} disabled={isAddLoading} className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ${isAddLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                        {isAddLoading ? <Loader className="size-8 animate-spin text-white" /> : "Add Trainer"}
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </AnimatePresence>


                <AnimatePresence>
                    {selectedTrainers && (
                        <MemberDetailModal
                            trainer={selectedTrainers}
                            onClose={() => setSelectedTrainers(null)}
                            blockUnblock={handleBlock}
                            isProcessing={processingId === selectedTrainers.trainer_id}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

}

function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-lg">
                {children}
            </motion.div>
        </div>
    );
}



function MemberDetailModal({ trainer, onClose, blockUnblock, isProcessing }) {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl">
                <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md p-6 border-b border-zinc-800 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        {trainer.profile_photo ? (
                            <img src={trainer.profile_photo} alt={trainer.name} className="size-14 rounded-full object-cover border-2 border-red-500/20" />
                        ) : (
                            <div className="size-14 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700"><User className="size-7" /></div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{trainer.name}</h2>
                            <p className="text-xs text-zinc-500 font-mono mt-1">ID: {trainer.trainer_id}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => blockUnblock(trainer.trainer_id)}
                        disabled={isProcessing}
                        className={`bg-zinc-800 rounded-xl cursor-pointer px-3 py-2 text-white flex gap-1 items-center transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? (
                            <Loader className="size-4 animate-spin" />
                        ) : (
                            trainer.is_active ? <Ban className='text-red-500 size-4' /> : <ShieldMinus className='text-green-500 size-4' />
                        )}
                        <span>{isProcessing ? "Processing..." : (trainer.is_active ? "Block User" : "Unblock User")}</span>
                    </button>

                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 cursor-pointer rounded-full text-zinc-400 hover:text-white"><X className="size-6" /></button>
                </div>

                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <InfoBox icon={<Mail />} label="Email Address" value={trainer.email} />
                        <InfoBox icon={<Phone />} label="Phone Number" value={trainer.phone} />
                        <InfoBox icon={<MapPin />} label="Home Address" value={trainer.address} />
                        <InfoBox icon={<Target />} label="Short Bio" value={trainer.short_bio} />
                        <InfoBox icon={<Gem />} label="Specializations" value={trainer.specializations.join(', ')} />
                        <InfoBox icon={<Award />} label="Certifications" value={trainer.certifications.join(', ')} />
                        <InfoBox icon={<Dumbbell />} label="Experience in years" value={trainer.experience_years} />
                        <InfoBox icon={<Clock />} label="Last Updated" value={new Date(trainer.updated_at).toLocaleString()} />
                        <InfoBox icon={<Clock />} label="Join Date" value={new Date(trainer.created_at).toLocaleString()} />
                        <InfoBox icon={<LogIn />} label="Last Login" value={new Date(trainer.last_login).toLocaleString()} />
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