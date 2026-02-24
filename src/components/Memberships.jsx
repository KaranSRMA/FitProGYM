import React, { useEffect } from 'react';
import { Check, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const REST_API = import.meta.env.VITE_REST_API;

const fetchPlans = async () => {
    try {
        const { data } = await axios.get(`${REST_API}/plans`, { withCredentials: true });
        return data;
    } catch (err) {
        const message = err.response?.data?.detail || "Failed to fetch plans!"
        throw new Error(message);
    }
}

export function Memberships() {
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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    const { data, error, isLoading, isError } = useQuery({
        queryKey: ['plans'],
        queryFn: () => fetchPlans(),
        placeholderData: (previousData) => previousData,
        staleTime: 30000,
    });

    useEffect(() => {
        if (isError) {
            const msg = error?.response?.data?.detail || 'Failed to fetch plans';
            toast.error(msg);
        }
    }, [isError, error]);

    const plans = data?.plans;

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-2xl font-bold text-white mb-4">Membership Plans</h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Choose the perfect plan for your fitness journey. All plans include access to our
                        world-class facilities and expert support.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                {isLoading ? (
                    <div>
                        <div className="py-20 text-center">
                            <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">Loading Plans...</p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid md:grid-cols-3 gap-8 mb-16"
                    >
                        {plans.map((plan, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -10 }}
                                className="relative"
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <div className="bg-red-500 text-white px-4 py-1 rounded-full">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={`h-full border ${plan.popular
                                        ? 'bg-linear-to-b from-red-500/10 to-zinc-900 border-red-500/50'
                                        : 'bg-zinc-900 border-zinc-800'
                                        } hover:border-zinc-700 border transition-all px-6 py-4 rounded-xl flex flex-col`}
                                >
                                    <div>
                                        <h2 className="text-white mb-2">{plan.plan_name}</h2>
                                        <p className="text-zinc-400 mb-4">{plan.description}</p>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-white">₹</span>
                                            <span className="text-white">{plan.price}</span>
                                            <span className="text-zinc-400">/{plan.duration}</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col flex-1'>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                    className="flex items-start gap-2"
                                                >
                                                    <Check className="size-5 text-red-500 shrink-0 mt-0.5" />
                                                    <span className="text-zinc-300">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <button
                                            className={`w-full mt-auto rounded-lg cursor-pointer py-2 text-white ${plan.popular
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-zinc-800 hover:bg-zinc-700'
                                                }`}
                                        >
                                            Choose {plan.plan_name}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                {plans?.length === 0 && !isLoading(
                    <div className="text-center py-12">
                        <p className="text-zinc-400">No membership plans available</p>
                    </div>
                )}

                {/* Additional Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-8"
                >
                    <h2 className="text-white text-center mb-6">All Plans Include</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-red-500 mb-2">No Commitment</div>
                            <p className="text-zinc-400">Cancel anytime, no questions asked</p>
                        </div>
                        <div className="text-center">
                            <div className="text-red-500 mb-2">Expert Support</div>
                            <p className="text-zinc-400">Access to certified trainers and staff</p>
                        </div>
                        <div className="text-center">
                            <div className="text-red-500 mb-2">Money-Back Guarantee</div>
                            <p className="text-zinc-400">30-day satisfaction guarantee</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
