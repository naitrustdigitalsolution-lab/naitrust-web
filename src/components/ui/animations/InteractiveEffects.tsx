import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import React from 'react';
import { ReactNode, useRef } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MagneticButton({ children, onClick, className = '' }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
}

export function FloatingElement({ children, className = '' }: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const handleScroll = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    y.set(rect.top * speed);
  };

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      onScroll={handleScroll}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RippleEffectProps {
  children: ReactNode;
  className?: string;
}

export function RippleEffect({ children, className = '' }: RippleEffectProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples([...ripples, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(ripples.filter(r => r.id !== id));
    }, 600);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      {ripples.map(({ x, y, id }) => (
        <motion.span
          key={id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'rgba(30, 144, 255, 0.3)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

interface MorphingShapeProps {
  className?: string;
}

export function MorphingShape({ className = '' }: MorphingShapeProps) {
  return (
    <motion.div
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
      }}
      transition={{
        repeat: Infinity,
        duration: 8,
        ease: 'easeInOut',
      }}
      className={`bg-gradient-to-br from-primary/20 to-primary/5 ${className}`}
    />
  );
}

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className = '' }: TextRevealProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}

interface React {
  useState: typeof import('react').useState;
}
