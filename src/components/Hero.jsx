import React from 'react'
import { Dumbbell, Target, Zap, Trophy } from 'lucide-react'
import { motion } from 'framer-motion';
import { Link } from 'react-router'

export function Hero() {
    const stats = [
        { label: "Members", value: "500+" },
        { label: "Trainers", value: "15+" },
        { label: "Access", value: "24/7" },
    ];

    const benefits = [
        {
            icon: Target,
            title: 'Personalized Programs',
            description: 'Custom workout plans tailored to your goals',
        },
        {
            icon: Zap,
            title: 'High-Performance Training',
            description: 'Push your limits with our advanced training methods',
        },
        {
            icon: Trophy,
            title: 'Proven Results',
            description: 'Join members who have achieved their dream physique',
        },
    ];
    return (
        <div className='relative min-h-screen flex items-center justify-center px-5 overflow-hidden'>
            {/* background */}
            <div className='absolute inset-0'>
                <img
                    src="https://images.unsplash.com/photo-1758875569612-94d5e0f1a35f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBhdGhsZXRlJTIwdHJhaW5pbmclMjBpbnRlbnNlfGVufDF8fHx8MTc2MzU1NTIyNHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt='Gym Hero'
                    className='w-full h-full object-cover'
                />
                <div className="absolute inset-0 bg-linear-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/30"></div>
            </div>
            {/* content  */}
            <div className='z-20 grid lg:grid-cols-2 gap-12 items-center'>
                {/* Left side */}
                <div>
                    {/* Badge  */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-block mb-4">
                            <div className='bg-red-500/20 border border-red-500/50 rounded-full flex items-center gap-2 px-4 py-2'>
                                <Dumbbell className='text-red-500 size-4' />
                                <span className='text-red-400 text-sm sm:text-base'>Premium Fitness Experience</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-white mb-6 leading-tight">Build Your Dream Body
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-zinc-300 mb-8 text-lg max-w-xl">
                            Transform your physique with world-class equipment, expert trainers, and a community of dedicated athletes. Your journey to greatness starts here.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex gap-2 sm:gap-4 flex-wrap text-xs sm:text-base">

                            <Link to='/login'>
                                <button className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-5 py-2 rounded-lg">Get Started Now</button>
                            </Link>

                            <Link to='/trainers'>
                                <button className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-zinc-950 px-5 py-1.5 rounded-lg">Meet Our Trainers</button>
                            </Link>
                        </motion.div>

                        {/* Stats  */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-zinc-700"
                        >
                            {stats.map((item) => (
                                <div key={item.label}>
                                    <div className='text-red-500 mb-1'>{item.value}</div>
                                    <div className='text-zinc-400'>{item.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right side  */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className='hidden lg:flex flex-col gap-4'
                    >
                        {benefits.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                                    whileHover={{ scale: 1.05, x: 10 }}
                                    className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg p-6"
                                >
                                    <Icon className="size-8 text-red-500 mb-3" />
                                    <h3 className="text-white mb-2">{item.title}</h3>
                                    <p className="text-zinc-400">{item.description}</p>

                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}


