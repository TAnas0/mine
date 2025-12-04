import { motion } from 'framer-motion';
import React from 'react';

const HeroIllustration = () => {
    return (
        <div className="w-full h-full flex items-center justify-center relative">
            <svg
                viewBox="0 0 800 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-w-[600px]"
            >
                {/* Desk Surface */}
                <motion.path
                    d="M100 400 L700 400 L600 550 L200 550 Z"
                    fill="currentColor"
                    className="text-base-300/50"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                />

                {/* Laptop Base */}
                <motion.path
                    d="M250 380 L550 380 L580 420 L220 420 Z"
                    fill="currentColor"
                    className="text-base-content/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                />

                {/* Laptop Screen */}
                <motion.rect
                    x="250"
                    y="150"
                    width="300"
                    height="230"
                    rx="10"
                    fill="currentColor"
                    className="text-base-content/80"
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                />

                {/* Screen Content (Code Lines) */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <motion.rect x="270" y="170" width="100" height="10" rx="2" fill="currentColor" className="text-primary/60"
                        animate={{ width: [100, 120, 100] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    />
                    <motion.rect x="270" y="190" width="200" height="8" rx="2" fill="currentColor" className="text-base-100/30" />
                    <motion.rect x="270" y="210" width="180" height="8" rx="2" fill="currentColor" className="text-base-100/30" />
                    <motion.rect x="270" y="230" width="220" height="8" rx="2" fill="currentColor" className="text-base-100/30" />

                    <motion.rect x="290" y="250" width="150" height="8" rx="2" fill="currentColor" className="text-secondary/60" />
                    <motion.rect x="290" y="270" width="130" height="8" rx="2" fill="currentColor" className="text-base-100/30" />

                    <motion.rect x="270" y="300" width="190" height="8" rx="2" fill="currentColor" className="text-base-100/30" />
                    <motion.rect x="270" y="320" width="160" height="8" rx="2" fill="currentColor" className="text-base-100/30" />
                </motion.g>

                {/* Coffee Mug */}
                <motion.g
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <path d="M620 360 L620 410 C620 425 605 430 590 430 L560 430 C545 430 540 425 540 410 L540 360 Z" fill="currentColor" className="text-secondary" />
                    <path d="M620 370 C635 370 640 380 640 390 C640 405 630 410 620 410" stroke="currentColor" strokeWidth="8" className="text-secondary" fill="none" />

                    {/* Smoke */}
                    {[0, 1, 2].map((i) => (
                        <motion.path
                            key={i}
                            d={`M${560 + i * 20} 350 Q${570 + i * 20} 330 ${560 + i * 20} 310`}
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-base-content/30"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0, y: 10 }}
                            animate={{
                                pathLength: [0, 1, 0],
                                opacity: [0, 0.6, 0],
                                y: [10, -20]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2.5,
                                delay: i * 0.8,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </motion.g>

                {/* Hands (Abstract) */}
                <motion.g>
                    {/* Left Hand */}
                    <motion.circle
                        cx="350" cy="430" r="25"
                        fill="currentColor" className="text-primary"
                        animate={{ y: [0, -5, 0], x: [0, 2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
                    />
                    {/* Right Hand */}
                    <motion.circle
                        cx="450" cy="430" r="25"
                        fill="currentColor" className="text-primary"
                        animate={{ y: [0, -5, 0], x: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.2, ease: "easeInOut" }}
                    />
                </motion.g>

            </svg>
        </div>
    );
};

export default HeroIllustration;
