import React, { useState, useEffect, useMemo } from 'react'
import { Award, Clock, Users, User, Loader, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function Trainers() {
    const REST_API = import.meta.env.VITE_REST_API;
    const [currentPage, setcurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTrainers = async (page) => {
        try {
            const { data } = await axios.get(`${REST_API}/trainers?page=${page}&limit=50`, {
                withCredentials: true,
            });
            return data;
        } catch (err) {
            const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to fetch users';
            throw new Error(message);
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
        }
    }, [isError, error]);

    const displayedTrainers = useMemo(() => {
        const trainers = data?.trainers ?? [];
        return trainers.filter(trainer => {
            const matchesSearch = trainer.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        })
    }, [data, searchQuery]);

    const totalTrainers = data?.trainer_count;

    const totalPages = Math.max(1, Math.ceil((totalTrainers ?? 0) / 50));
    const maxPagesToShow = 6;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), Math.max(1, totalPages - maxPagesToShow + 1)));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);



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

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-white text-2xl font-bold mb-2">Our Expert Trainers</h1>
                    <p className="text-zinc-400">
                        Meet our certified fitness professionals ready to help you achieve your goals
                    </p>
                </motion.div>

                <div className='sticky bg-zinc-950/95 backdrop-blur-sm mb-2 top-[65px] z-10'>
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

                        <div className="flex items-center gap-2">
                            <button onClick={() => setcurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg border ${currentPage === 1 ? 'text-zinc-500 border-zinc-800 cursor-not-allowed' : 'text-white border-zinc-700 cursor-pointer hover:bg-zinc-800'}`}>Previous</button>
                            <div className="flex items-center gap-1">
                                {pages.map((p) => (
                                    <button key={p} onClick={() => setcurrentPage(p)} className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${currentPage === p ? 'bg-red-500 text-white' : 'text-white bg-zinc-800 hover:bg-zinc-700'}`}>{p}</button>
                                ))}
                            </div>
                            <button onClick={() => setcurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className={`px-3 py-1 rounded-lg border ${currentPage >= totalPages ? 'text-zinc-500 border-zinc-800 cursor-not-allowed' : 'text-white cursor-pointer border-zinc-700 hover:bg-zinc-800'}`}>Next</button>
                        </div>
                    </div>
                </div>

                {displayedTrainers.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">No trainers found</p>
                    </div>
                )}

                {isLoading && (
                    <div className="py-20 text-center">
                        <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Loading Trainers...</p>
                    </div>
                )}

                {/* Trainers Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {displayedTrainers.map((trainer) => (
                        <motion.div
                            key={trainer.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            {/* card  */}
                            <div className="bg-zinc-900 rounded-2xl border-zinc-800 h-full hover:border-zinc-700 transition-all overflow-hidden group flex flex-col">
                                {/* Trainer Image */}
                                <div className="relative h-40 overflow-hidden">
                                    {trainer.profile_photo ? (
                                        <img
                                            src={trainer.image}
                                            alt={trainer.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />) : (
                                        <div className="w-full h-full size-14 bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700"><User className="size-7" /></div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                                </div>

                                <div className='px-6 pt-10'>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-white mb-2">{trainer.name}</h2>
                                            <p className="text-red-500">{trainer.specializations.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='px-6 py-6 flex flex-col flex-1'>
                                    <div>
                                        <p className="text-zinc-400 mb-4">{trainer.short_bio}</p>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Clock className="size-4 text-red-500" />
                                                <span className="text-sm">{trainer.experience_years}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Users className="size-4 text-red-500" />
                                                {/* <span className="text-sm">{trainer.clients} clients</span> */}
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award className="size-4 text-red-500" />
                                                <span className="text-zinc-400">Certifications</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {trainer.certifications.map((cert, index) => (
                                                    <div
                                                        key={index}
                                                        variant="secondary"
                                                        className="bg-zinc-800 text-zinc-300 rounded-lg px-3 py-0.5 text-xs hover:bg-zinc-700"
                                                    >
                                                        {cert}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button className="mt-auto rounded-lg py-2 text-white cursor-pointer w-full bg-red-500 hover:bg-red-600">
                                        Book Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-16 bg-zinc-900 border border-zinc-800 rounded-lg py-8 px-3 sm:p-8 text-center"
                >
                    <h2 className="text-white text-md sm:text-base mb-4">Need Help Choosing a Trainer?</h2>
                    <p className="text-zinc-400 mb-6 max-w-2xl text-sm sm:text-base mx-auto">
                        Not sure which trainer is right for you? Our team can help match you with the perfect
                        trainer based on your goals, experience level, and preferences.
                    </p>
                    <button className="rounded-lg py-2 px-4 text-sm sm:text-base text-white bg-red-500 hover:bg-red-600">
                        Get Personalized Recommendation
                    </button>
                </motion.div>

            </div>
        </div>
    )
}
