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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-5xl font-extrabold mb-6 tracking-tight"
            >
                I'm <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">{fullName}.</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
                className="text-2xl text-base-content/80 mb-6 font-light"
            >
                {title}{institute ? ` at ${institute}` : ''}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                className="text-lg mb-8 leading-relaxed text-base-content/70 space-y-4"
            >
                <p>
                    Let me welcome you to my collection of technical notes, experiments, and essays on software engineering, infrastructure, and the systems that shape how software is built and used.
                </p>
                <p>
                    I’m a software engineer with over a decade of experience building and scaling systems across backend and infrastructure.
                    I got my <span className="font-bold">start in backend development</span> and expanded into DevOps, frontend, and web security, with a focus on understanding systems end to end.
                </p>
                <p>
                    My strength is <span className="font-bold">connecting dots</span> across domains and turning ambiguity into working plans and designs.
                </p>
                <p>
                    I hope you find the writing useful. Feel free to reach out if you’d like to discuss any of it.
                </p>

                {/* TODO recommended reading: Python vs. data vs. psychology */}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
                className="flex gap-4"
            >
                {children}
            </motion.div>
        </div>
    );
}
