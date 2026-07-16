import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Shield size={40} className="text-white" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <h3 className="text-primary">Naitrust</h3>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    </div>
  );
}
