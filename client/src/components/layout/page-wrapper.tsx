import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import EnhancedHeader from './enhanced-header';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function PageWrapper({ 
  children, 
  title, 
  subtitle, 
  icon 
}: PageWrapperProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <EnhancedHeader />
      
      <motion.div
        className="md:ml-64 pt-24 md:pt-20 pb-12 px-6 md:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        {(title || subtitle || icon) && (
          <motion.div className="mb-12" variants={itemVariants}>
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/50">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-blue-300 text-sm mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Page Content */}
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
