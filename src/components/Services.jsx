import React from 'react'
import { motion } from 'framer-motion';
import {
    Dumbbell,
    Users,
    Target,
    Trophy,
    Shield,
    Heart,
} from 'lucide-react';

export function Services() {
    const services = [
        {
            icon: Dumbbell,
            title: 'Weight Training',
            description: 'Full range of free weights and resistance machines',
        },
        {
            icon: Heart,
            title: 'Cardio Zone',
            description: 'Treadmills, bikes, ellipticals and rowing machines',
        },
        {
            icon: Users,
            title: 'Group Classes',
            description: 'HIIT, Yoga, Spin, Boxing and more',
        },
        {
            icon: Target,
            title: 'Personal Training',
            description: '1-on-1 coaching with certified professionals',
        },
        {
            icon: Trophy,
            title: 'Nutrition Coaching',
            description: 'Meal plans and dietary guidance',
        },
        {
            icon: Shield,
            title: 'Recovery Zone',
            description: 'Sauna, massage and stretching areas',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };
    return (
        <div className="py-20 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4"
                    >
                        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-full px-4 py-2">
                            <Trophy className="size-4 text-red-500" />
                            <span className="text-red-400">Our Services</span>
                        </div>
                    </motion.div>
                    <h2 className="text-white mb-4">Everything You Need to Succeed</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Comprehensive fitness services designed to help you achieve your goals
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 h-full hover:border-red-500/50 transition-all">
                                    <div className="p-6">
                                        <div className="size-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                                            <Icon className="size-6 text-red-500" />
                                        </div>
                                        <h3 className="text-white mb-2">{service.title}</h3>
                                        <p className="text-zinc-400">{service.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>

    )
}

