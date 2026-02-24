import React from 'react'
import { motion } from 'framer-motion';
import {
    Clock,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import { Link } from 'react-router';

export function ContactInfo() {
    return (
        <section className="py-20 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-white mb-6">Visit Us Today</h2>
                        <p className="text-zinc-400 mb-8">
                            Come experience FitPro Gym for yourself. Take a free tour and see why we're the best choice for your fitness journey.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <MapPin className="size-5 text-red-500" />
                                <span>123 Fitness Street, Downtown, CA 90210</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Phone className="size-5 text-red-500" />
                                <span>(555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Mail className="size-5 text-red-500" />
                                <span>info@fitprogym.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Clock className="size-5 text-red-500" />
                                <span>Open 24/7 for Members</span>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-8"
                    >
                        <h3 className="text-white mb-6">Get Started Today</h3>
                        <div className="space-y-4 flex flex-col">
                            <Link to="/memberships">
                                <button className="rounded-lg py-2 w-full bg-red-500 hover:bg-red-600 text-white">
                                    View Membership Plans
                                </button>
                            </Link>
                            <Link to="/trainers">
                                <button
                                    className="rounded-lg py-2 border w-full border-zinc-700 text-white bg-zinc-900 hover:bg-zinc-800"
                                >
                                    Meet Our Trainers
                                </button>
                            </Link>
                            <Link to="/dashboard">
                                <button
                                    className="rounded-lg py-2 border w-full border-zinc-700 text-white bg-zinc-900 hover:bg-zinc-800"
                                >
                                    Member Dashboard
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
