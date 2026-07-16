import { motion } from 'motion/react';
import { User, Building2, Handshake } from 'lucide-react';

interface TrustHeroAnimationProps {
  className?: string;
}

export function TrustHeroAnimation({ className = '' }: TrustHeroAnimationProps) {
  return (
    <div className={`relative w-full flex items-center justify-center overflow-hidden ${className}`} style={{ height: '160px' }}>
      <div className="relative mx-auto" style={{ width: '50rem', maxWidth: '95%', height: '160px' }}>

        {/* Customer (Left Side) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: '0px' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 40px rgba(59, 130, 246, 0.5)',
                '0 0 20px rgba(59, 130, 246, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <User className="w-7 h-7 text-white" />
          </motion.div>
        </motion.div>

        {/* Business (Right Side) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ right: '0px' }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 20px rgba(34, 197, 94, 0.3)',
                '0 0 40px rgba(34, 197, 94, 0.5)',
                '0 0 20px rgba(34, 197, 94, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          >
            <Building2 className="w-7 h-7 text-white" />
          </motion.div>
        </motion.div>

        {/* Left connector: Customer → Handshake */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-0"
          style={{ left: '72px', width: '300px', height: '40px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="relative w-full h-full">
            {/* Dotted section */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute"
                  style={{ left: `${(i / 4) * 100}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, delay: 1 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </motion.div>
              ))}
            </div>

            {/* Solid line section */}
            <motion.div
              className="absolute left-1/3 top-1/2 -translate-y-1/2 w-1/3 h-0.5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1.2, ease: 'easeInOut' }}
            >
              <div className="w-full h-full bg-primary to-primary opacity-60 dark:opacity-70" />
            </motion.div>

            {/* Flowing particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`lp-${i}`}
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2"
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: ['0%', '33%', '66%', '100%'], y: [0, -6, 0, 6, 0], opacity: [0, 1, 1, 0.8, 0] }}
                transition={{ duration: 3, delay: 1.6 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right connector: Handshake → Business */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-0"
          style={{ right: '72px', width: '300px', height: '40px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="relative w-full h-full">
            {/* Solid line section */}
            <motion.div
              className="absolute left-1/3 top-1/2 -translate-y-1/2 w-1/3 h-0.5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1.4, ease: 'easeInOut' }}
            >
              <div className="w-full h-full bg-gradient-to-r from-primary via-green-400 to-green-500 opacity-60 dark:opacity-70" />
            </motion.div>

            {/* Dotted section */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={`dot-b-${i}`}
                  className="absolute"
                  style={{ right: `${(i / 4) * 100}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, delay: 1.6 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </motion.div>
              ))}
            </div>

            {/* Flowing particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`rp-${i}`}
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2"
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: ['0%', '-33%', '-66%', '-100%'], y: [0, 6, 0, -6, 0], opacity: [0, 1, 1, 0.8, 0] }}
                transition={{ duration: 3, delay: 1.8 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Center — Handshake */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-0.5 bg-primary via-primary to-green-500 opacity-0" />

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-primary/50"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-green-500/50"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />

          <motion.div
            className="relative w-14 h-14 bg-gradient-to-br from-primary to-green-500 rounded-full flex items-center justify-center shadow-xl z-10"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Handshake className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
