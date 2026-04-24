import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, BookOpen, Users, TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small delay before transitioning
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 4 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                i % 4 === 2 ? 'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500' :
                'w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500'
              }`}
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: 0 
              }}
              animate={{ 
                y: [null, -200],
                x: [null, Math.random() * 200 - 100],
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0]
              }}
              transition={{ 
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              MasterStudent
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl text-slate-300 mb-8"
          >
            India's Premier Study Notes Marketplace
          </motion.p>
        </motion.div>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex space-x-8 mb-12"
        >
          {[
            { icon: BookOpen, label: "Premium Notes", color: "from-orange-400 to-red-500" },
            { icon: Users, label: "Top Community", color: "from-purple-400 to-pink-500" },
            { icon: TrendingUp, label: "Earn Money", color: "from-cyan-400 to-blue-500" }
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.2, type: "spring", bounce: 0.5 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-slate-400 font-medium">{feature.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">Loading your experience</span>
            <span className="text-orange-400 text-sm font-medium">{progress}%</span>
          </div>
          
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex space-x-2 mt-8"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>

        {/* Sparkles Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute top-1/3 right-1/4"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-1/3 left-1/4"
        >
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-6 h-6 text-pink-400" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
