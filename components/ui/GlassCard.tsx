"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({ children, className = '', hover = true, gradient = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        backdrop-blur-lg bg-white/10 dark:bg-black/10
        border border-white/20 dark:border-white/10
        rounded-3xl shadow-2xl
        ${gradient ? 'bg-gradient-to-br from-white/20 to-white/5 dark:from-black/20 dark:to-black/5' : ''}
        ${hover ? 'hover:shadow-3xl transition-all duration-500' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
