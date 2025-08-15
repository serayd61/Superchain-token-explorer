"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, Bell, BarChart3, Zap } from "lucide-react";

// UI Components
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

// Existing Components
import ChainSelector from "@/components/ChainSelector";
import DeployerLeaderboard from "@/components/DeployerLeaderboard";
import NotificationSettings from "@/components/NotificationSettings";
import PriceAlerts from "@/components/PriceAlerts";
import TokenSafetyAnalyzer from "@/components/TokenSafetyAnalyzer";
import TokenScanner from "@/components/TokenScanner";
import TokenTable from "@/components/TokenTable";
import SuperchainDashboard from "@/components/superchain/SuperchainDashboard";
import CrossChainTokenTracker from "@/components/superchain/CrossChainTokenTracker";

const sampleTokens = [
  {
    chain: "base",
    block: 12345678,
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    from: "0xabcdef1234567890abcdef1234567890abcdef12",
    timestamp: new Date().toISOString(),
    lp_status: "YES",
    price_chart: [1, 1.2, 0.8, 1.5, 1.3, 1.1, 1.4] as number[]
  }
];

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<string>("base");
  const [activeSection, setActiveSection] = useState<string>("overview");

  const navigationItems = [
    { id: "overview", label: "Overview", icon: <Sparkles className="w-4 h-4" /> },
    { id: "scanner", label: "Scanner", icon: <Zap className="w-4 h-4" /> },
    { id: "safety", label: "Safety", icon: <Shield className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "alerts", label: "Alerts", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />
      <FloatingParticles />
      
      {/* Navigation Header */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 p-6"
      >
        <GlassCard className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Superchain Explorer
                </h1>
                <p className="text-xs text-gray-400">Next-gen token tracker</p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <AnimatedButton
                  key={item.id}
                  variant={activeSection === item.id ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </AnimatedButton>
              ))}
            </div>

            <ThemeToggle />
          </div>
        </GlassCard>
      </motion.nav>

      <main className="relative z-10">
        <div className="container mx-auto px-6 space-y-12">
          {/* Hero Section */}
          <motion.section 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Superchain
              </span>
              <br />
              <span className="text-white">Explorer</span>
            </h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Discover, analyze, and track token deployments across the entire Optimism Superchain ecosystem.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <AnimatedButton size="lg" className="px-8 py-4">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Exploring
              </AnimatedButton>
              <AnimatedButton variant="ghost" size="lg" className="px-8 py-4">
                View Analytics
              </AnimatedButton>
            </motion.div>
          </motion.section>

          {/* Stats Cards */}
          <motion.section 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              { label: "Chains Monitored", value: "7+", icon: "🔗" },
              { label: "Tokens Scanned", value: "12.5K", icon: "🪙" },
              { label: "Safety Checks", value: "99.9%", icon: "🛡️" },
              { label: "Real-time Updates", value: "24/7", icon: "⚡" }
            ].map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center" gradient hover>
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm">
                  {stat.label}
                </div>
              </GlassCard>
            ))}
          </motion.section>

          {/* Dynamic Content */}
          <motion.section 
            key={activeSection}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {activeSection === "overview" && (
              <>
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  🌐 Superchain Overview
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <GlassCard className="p-8" gradient>
                    <SuperchainDashboard />
                  </GlassCard>
                  <GlassCard className="p-8" gradient>
                    <CrossChainTokenTracker />
                  </GlassCard>
                </div>
              </>
            )}

            {activeSection === "scanner" && (
              <>
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  🔍 Token Scanner
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <GlassCard className="p-6" gradient>
                    <ChainSelector
                      selectedChain={selectedChain}
                      onChainChange={setSelectedChain}
                    />
                  </GlassCard>
                  <GlassCard className="p-8" gradient>
                    <TokenScanner />
                  </GlassCard>
                </div>
              </>
            )}

            {activeSection === "safety" && (
              <>
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  🛡️ Token Safety Analyzer
                </h2>
                <GlassCard className="p-8" gradient>
                  <TokenSafetyAnalyzer
                    contractAddress="0x1234567890abcdef1234567890abcdef12345678"
                    chain={selectedChain}
                    tokenSymbol="SAMPLE"
                    tokenName="Sample Token"
                  />
                </GlassCard>
              </>
            )}

            {activeSection === "analytics" && (
              <>
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  📊 Analytics Dashboard
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <GlassCard className="p-8" gradient>
                    <TokenTable tokens={sampleTokens} />
                  </GlassCard>
                  <GlassCard className="p-8" gradient>
                    <DeployerLeaderboard tokens={[]} isLoading={false} />
                  </GlassCard>
                </div>
              </>
            )}

            {activeSection === "alerts" && (
              <>
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  🔔 Alerts & Notifications
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard className="p-6" gradient>
                    <PriceAlerts />
                  </GlassCard>
                  <GlassCard className="p-6" gradient>
                    <NotificationSettings />
                  </GlassCard>
                </div>
              </>
            )}
          </motion.section>

          {/* Footer */}
          <motion.footer 
            className="pt-16 pb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <GlassCard className="py-8 px-6">
              <p className="text-gray-300">
                Proudly building on the Superchain • OP Stack Ecosystem
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-gray-400">Live & Monitoring</span>
              </div>
            </GlassCard>
          </motion.footer>
        </div>
      </main>
    </div>
  );
}
