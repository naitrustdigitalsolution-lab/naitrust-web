import { motion, PanInfo, useMotionValue, useTransform } from 'motion/react';
import { ReactNode } from 'react';

interface SwipeableMessageProps {
  children: ReactNode;
  onSwipeReply?: () => void;
  direction: 'left' | 'right';
}

export function SwipeableMessage({ children, onSwipeReply, direction }: SwipeableMessageProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    direction === 'right' ? [0, 80] : [-80, 0],
    ['rgba(0,0,0,0)', 'rgba(30, 144, 255, 0.1)']
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    const swipeDistance = direction === 'right' ? info.offset.x : -info.offset.x;

    if (swipeDistance > threshold && onSwipeReply) {
      onSwipeReply();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: direction === 'left' ? -100 : 0, right: direction === 'right' ? 100 : 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, background }}
      className="rounded-2xl relative"
    >
      {children}
    </motion.div>
  );
}

interface FadeInMessageProps {
  children: ReactNode;
  delay?: number;
}

export function FadeInMessage({ children, delay = 0 }: FadeInMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start"
    >
      <div className="bg-card rounded-2xl px-5 py-3 shadow-sm border border-border">
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((delay, index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface ScrollToBottomButtonProps {
  onClick: () => void;
  show: boolean;
}

export function ScrollToBottomButton({ onClick, show }: ScrollToBottomButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </motion.button>
  );
}

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const y = useMotionValue(0);
  const refreshProgress = useTransform(y, [0, 100], [0, 1]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      await onRefresh();
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={{ y }}
      className="relative"
    >
      {/* Pull to Refresh Indicator */}
      <motion.div
        style={{
          opacity: refreshProgress,
          scale: refreshProgress,
        }}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full p-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </motion.div>
      {children}
    </motion.div>
  );
}

// Smooth scroll behavior with spring animation
export const smoothScrollVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Message bubble pop-in animation
export const messageBubbleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
};

// Slide in from side animation
export const slideInVariants = {
  fromLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  fromRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
};

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};
