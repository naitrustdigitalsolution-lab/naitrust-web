import { motion } from 'motion/react';
import { CheckCircle2, Banknote } from 'lucide-react';

export function PaymentSuccessAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Money Animation */}
      <div className="relative w-32 h-32 mb-6">
        {/* Stacked Notes */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ x: -100, y: -100, opacity: 0, rotate: -20 }}
            animate={{
              x: index * 4,
              y: index * 4,
              opacity: 1,
              rotate: 0,
            }}
            transition={{
              delay: index * 0.15,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="absolute inset-0"
          >
            <div className="w-full h-full bg-primary rounded-lg border-2 border-primary/50 flex items-center justify-center">
              <Banknote size={48} className="text-white" />
            </div>
          </motion.div>
        ))}

        {/* Check Mark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
            <CheckCircle2 size={32} className="text-white" strokeWidth={3} />
          </div>
        </motion.div>
      </div>

      {/* Confetti */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [-20, -80],
            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
            opacity: [1, 0],
            scale: [1, 0.5],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            delay: 0.8 + Math.random() * 0.3,
            duration: 1 + Math.random() * 0.5,
            ease: 'easeOut',
          }}
          className="absolute top-1/2 left-1/2"
          style={{
            width: 8,
            height: 8,
            backgroundColor: ['#2BB673', '#0B2B45', '#60A5FA', '#F59E0B'][Math.floor(Math.random() * 4)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <h2 className="text-primary mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">
          Your payment is being held securely in escrow
        </p>
      </motion.div>
    </div>
  );
}
