import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ShimmerEffectProps {
  className?: string;
}

const itemsWithWidth = [1,2,3,4,5,6,7,8,9,10].map(item => {
  const min = 25; // minimum percentage
  const max = 40; // maximum percentage
  const width = Math.floor(Math.random() * (max - min + 1)) + min;

  return { id: item, width: `${width}%` };
});


export function ShimmerEffect({ className = '' }: ShimmerEffectProps) {
  return (
    <div className={`relative overflow-hidden bg-muted rounded ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ['100%', '-100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {itemsWithWidth.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: item.id * 0.1 }}
          className={`flex ${item.id % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className="space-y-2 rounded-2xl p-2"
            style={{ width: item.width }}   // this now actually controls the width
          >
            <ShimmerEffect className="h-16 w-full rounded-2xl" />
            <ShimmerEffect className="h-2 w-1/4 rounded-2xl" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border"
        >
          <ShimmerEffect className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerEffect className="h-4 w-3/4" />
            <ShimmerEffect className="h-3 w-1/2" />
          </div>
          <ShimmerEffect className="h-8 w-12 rounded-full" />
        </motion.div>
      ))}
    </div>
  );
}

interface GlowEffectProps {
  children: ReactNode;
  color?: string;
}

export function GlowEffect({ children, color = '#1E90FF' }: GlowEffectProps) {
  return (
    <motion.div
      whileHover={{
        filter: `drop-shadow(0 0 8px ${color}40)`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function PulseEffect({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
