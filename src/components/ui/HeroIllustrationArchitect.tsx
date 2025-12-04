import { motion } from 'framer-motion';
import React from 'react';

const HeroIllustrationArchitect = () => {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-base-200/20 rounded-3xl p-8">
            <h3 className="absolute top-4 left-4 text-sm font-bold opacity-50">Concept 2: The Digital Architect</h3>
            <svg
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-w-[500px]"
            >
                {/* Central Cube Structure */}
                <motion.g
                    animate={{ rotateY: 360, rotateX: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "center" }}
                >
                    {/* Abstract Nodes */}
                    {[...Array(6)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx={300 + Math.cos(i * 1.05) * 100}
                            cy={300 + Math.sin(i * 1.05) * 100}
                            r="8"
                            fill="currentColor"
                            className="text-primary"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5
                            }}
                        />
                    ))}

                    {/* Connecting Lines */}
                    {[...Array(6)].map((_, i) => (
                        <motion.line
                            key={`line-${i}`}
                            x1={300 + Math.cos(i * 1.05) * 100}
                            y1={300 + Math.sin(i * 1.05) * 100}
                            x2={300 + Math.cos((i + 2) * 1.05) * 100}
                            y2={300 + Math.sin((i + 2) * 1.05) * 100}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-base-content/20"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                        />
                    ))}

                    {/* Inner Geometric Shape */}
                    <motion.rect
                        x="250" y="250" width="100" height="100"
                        stroke="currentColor" strokeWidth="4"
                        className="text-secondary/50"
                        fill="none"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                </motion.g>

                {/* Floating Elements */}
                {[...Array(5)].map((_, i) => (
                    <motion.rect
                        key={`float-${i}`}
                        x={100 + Math.random() * 400}
                        y={100 + Math.random() * 400}
                        width={10 + Math.random() * 20}
                        height={10 + Math.random() * 20}
                        fill="currentColor"
                        className="text-accent/30"
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 90, 180]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2
                        }}
                    />
                ))}

            </svg>
        </div>
    );
};

export default HeroIllustrationArchitect;
