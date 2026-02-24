import React from 'react'
import { motion } from 'framer-motion';
import { 
  Clock, 
  Shield,
  Heart,
  LayoutDashboard,
  Calendar,
  Wifi,
} from 'lucide-react';

export function PremiumAmenities() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const amenities = [
        { icon: Wifi, text: 'Free High-Speed WiFi' },
        { icon: Clock, text: '24/7 Access Available' },
        { icon: Shield, text: 'Secure Locker Rooms' },
        { icon: Heart, text: 'Modern Showers & Changing Rooms' },
        { icon: Calendar, text: 'Flexible Scheduling' },
        { icon: LayoutDashboard , text: 'Member Activity Dashboard' },
    ];
    return (
        <section className="py-20 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-white mb-4">Premium Amenities</h2>
                </motion.div>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {amenities.map((amenity, index) => {
                        const Icon = amenity.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-colors"
                            >
                                <Icon className="size-5 text-red-500" />
                                <span className="text-zinc-300">{amenity.text}</span>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    )
}
