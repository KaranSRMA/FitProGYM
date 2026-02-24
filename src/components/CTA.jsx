import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion';

export function CTA() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1664673531303-c933ac4cee70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwbGlmdGluZyUyMHdlaWdodHN8ZW58MXx8fHwxNzYzNTUyNTc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="CTA Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-red-600/95 to-red-500/95" />
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-white mb-4">Ready to Transform Your Life?</h2>
                    <p className="text-red-50 mb-8 text-lg">
                        Don't wait for tomorrow. Start building the body you've always wanted today.
                    </p>
                    <Link to="/signup">
                        <button className="bg-white text-red-600 hover:bg-zinc-200 rounded-lg px-4 py-2 cursor-pointer">
                            Start Your Journey Now
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
