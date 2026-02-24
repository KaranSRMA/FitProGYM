import React from 'react'
import { motion } from 'framer-motion';

export function Features() {
    const features = [
        {
            title: 'State-of-the-art Equipment',
            description: 'Access to the latest fitness equipment and technology',
            image: 'https://images.unsplash.com/photo-1761971975769-97e598bf526b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBneW0lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjM1MDg5NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            title: 'Expert Personal Training',
            description: 'One-on-one coaching to help you reach your fitness goals',
            image: 'https://images.unsplash.com/photo-1648542036561-e1d66a5ae2b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluaW5nfGVufDF8fHx8MTc2MzQ4NTk2NXww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            title: 'Group Fitness Classes',
            description: 'Join our energetic group classes led by certified instructors',
            image: 'https://images.unsplash.com/photo-1758798458635-f01402b40919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY2xhc3MlMjBncm91cHxlbnwxfHx8fDE3NjM1NTUyMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
        <section className="py-20 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-white mb-4">World-Class Facilities</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Experience premium amenities designed for your comfort and success
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -10 }}
                        >
                            <div className="bg-zinc-950 border-zinc-800 overflow-hidden group cursor-pointer rounded-2xl h-full">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-300" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-white mb-3 group-hover:text-red-500 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-zinc-400">{feature.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
