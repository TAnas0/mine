import { motion } from 'framer-motion';
import React from 'react';

interface HeroContentProps {
    fullName: string;
    title: string;
    institute: string;
    children?: React.ReactNode;
}

export default function HeroContent({ fullName, title, institute, children }: HeroContentProps) {
    return (
        <div className="flex-1">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-extrabold mb-6 tracking-tight"
            >
                Welcome! I'm <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{fullName} 👋</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl text-base-content/80 mb-6 font-light"
            >
                {title}{institute ? ` at ${institute}` : ''}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg mb-8 leading-relaxed text-base-content/70 space-y-4"
            >
                <p>
                    I am a curious Software Engineer with an ever-growing field of interest.
                </p>
                <p>
                    I started out as a backend developer and, over the past decade, wandered
                    into DevOps, frontend development, Web3, networking — and even dipped into
                    UI/UX design, business, and psychology. If it’s connected to Tech, I love exploring it.
                </p>
                <p>
                    Probably too many interests for my own good 😅 — but I wouldn’t have it any other way!
                </p>
                <p>
                    I guess you could call me a generalist, a jack of all trades, or maybe just
                    a versatilist who enjoys connecting dots across disciplines.
                </p>
                <p>
                    Whatever you are here looking for, I hope you find it!
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-4"
            >
                {children}
            </motion.div>
        </div>
    );
}
