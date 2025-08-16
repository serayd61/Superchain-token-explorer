"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Heart, Github, Twitter, ExternalLink, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 pb-8">
      <div className="container mx-auto px-6">
        <GlassCard className="p-8" gradient>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Superchain Explorer</h3>
                  <p className="text-sm text-gray-300">Next-gen token tracker</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Real-time token deployment tracking across the Optimism Superchain ecosystem 
                with advanced safety analytics and modern design.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <div className="space-y-2">
                <a href="#scanner" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Token Scanner
                </a>
                <a href="#safety" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Safety Analyzer
                </a>
                <a href="#analytics" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Analytics
                </a>
                <a href="#alerts" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Price Alerts
                </a>
              </div>
            </div>

            {/* Supported Chains */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Supported Chains</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-blue-400">🔵</span> Base
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-red-400">🔴</span> OP Mainnet
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">🟢</span> Mode
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-purple-400">🟣</span> Zora
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-gray-400">⟠</span> Ethereum
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-blue-300">🔷</span> Arbitrum
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                  ✨ OP Stack Optimized
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-6"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright & Creator */}
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="text-gray-300 text-sm">
                © {currentYear} Superchain Explorer. All rights reserved.
              </div>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-300">Built with</span>
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-gray-300">by</span>
                <span className="text-white font-semibold">Serkan Aydin</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://x.com/serayd61"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
              >
                <Twitter className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                <span className="text-sm text-gray-300 group-hover:text-white">Twitter</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-300" />
              </motion.a>

              <motion.a
                href="https://github.com/serayd61"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
              >
                <Github className="w-4 h-4 text-gray-300 group-hover:text-white" />
                <span className="text-sm text-gray-300 group-hover:text-white">GitHub</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-300" />
              </motion.a>

              <motion.a
                href="https://linkedin.com/in/serkan-aydin"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
              >
                <Linkedin className="w-4 h-4 text-blue-500 group-hover:text-blue-400" />
                <span className="text-sm text-gray-300 group-hover:text-white">LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-300" />
              </motion.a>
            </div>
          </div>

          {/* Tech Stack Badge */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                Next.js 14
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                Framer Motion
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                Tailwind CSS
              </span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                Ethers.js
              </span>
              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full">
                Vercel
              </span>
            </div>
            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Proudly building on the Superchain • OP Stack Ecosystem</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}
