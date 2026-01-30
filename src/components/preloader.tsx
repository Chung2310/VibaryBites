'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export const Preloader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 1.5,
        }}
      >
        <Image src="/logo.png" alt="Vibary Logo" width={64} height={64} priority />
      </motion.div>
    </motion.div>
  );
};
