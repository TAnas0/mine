import { motion } from 'framer-motion';
import React from 'react';

interface MotionWrapperProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export default function MotionWrapper({ children, delay = 0, duration = 0.5, className = "" }: MotionWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: duration, 
                delay: delay,
                ease: "easeOut"
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
