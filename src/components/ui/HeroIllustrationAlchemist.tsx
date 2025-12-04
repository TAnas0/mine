import { motion } from 'framer-motion';
import React from 'react';

const HeroIllustrationAlchemist = () => {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-base-200/20 rounded-3xl p-8">
            <h3 className="absolute top-4 left-4 text-sm font-bold opacity-50">Concept 3: The Code Alchemist</h3>
            <svg
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-w-[500px]"
            >
                {/* Central Core */}
                <motion.circle
                    cx="300" cy="300" r="60"
                    fill="url(#coreGradient)"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <defs>
                    <radialGradient id="coreGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(300 300) rotate(90) scale(60)">
                        <stop stopColor="currentColor" className="text-primary" />
                        <stop offset="1" stopColor="currentColor" className="text-secondary" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Orbiting Rings */}
                {[100, 160, 220].map((r, i) => (
                    <motion.circle
                        key={i}
                        cx="300" cy="300" r={r}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-base-content/10"
                        strokeDasharray="10 10"
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "center" }}
                    />
                ))}

                {/* Particles/Energy */}
                {[...Array(12)].map((_, i) => (
                    <motion.circle
                        key={`particle-${i}`}
                        cx="300" cy="300" r="4"
                        fill="currentColor"
                        className="text-secondary"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            x: Math.cos(i * 30 * (Math.PI / 180)) * 200,
                            y: Math.sin(i * 30 * (Math.PI / 180)) * 200,
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: i * 0.2
                        }}
                    />
                ))}

                {/* Code Symbols */}
                <motion.text x="280" y="300" fill="currentColor" className="text-base-100 font-mono text-2xl font-bold"
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                >
                    &lt;/&gt;
                </motion.text>

            </svg>
        </div>
    );
};

export default HeroIllustrationAlchemist;
