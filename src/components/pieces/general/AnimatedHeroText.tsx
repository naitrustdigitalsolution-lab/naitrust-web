import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroMessage {
  headline: string;
  headlineHighlight: string;
  subtext: string;
  subtextHighlight: string;
}

const heroMessages: HeroMessage[] = [
  {
    headline: 'Complete important deals',
    headlineHighlight: 'without blind trust.',
    subtext: 'Naitrust helps buyers, sellers, contractors, suppliers, and service providers agree terms, verify both sides, ',
    subtextHighlight: 'protect payments through regulated partners, and complete transactions with evidence.',
  },
  {
    headline: 'Agree terms before',
    headlineHighlight: 'money moves.',
    subtext: 'Create one transaction room with roles, amount, timeline, delivery conditions, and required proof. ',
    subtextHighlight: 'Everyone sees what was agreed before payment or release decisions happen.',
  },
  {
    headline: 'Keep proof, payment, and',
    headlineHighlight: 'disputes in one place.',
    subtext: 'Invoices, delivery photos, waybills, approvals, payment updates, and issue reports stay attached to the deal. ',
    subtextHighlight: 'No more scattered proof across chats.',
  },
  {
    headline: 'Build reputation from',
    headlineHighlight: 'completed safe deals.',
    subtext: 'Reusable verification and completed transaction records help honest businesses prove reliability over time. ',
    subtextHighlight: 'Trust becomes portable evidence.',
  },
];

export function AnimatedHeroText() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMessages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentMessage = heroMessages[currentIndex];

  return (
    <div className="relative">
      {/* Headline */}
      <div className="grid min-h-[250px] place-items-center md:min-h-[232px] px-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`hero-copy-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: 'easeInOut' }}
            className="flex flex-col items-center h-auto md:h-120 mt-4"
          >
            <h1 className="naitrust-satoshi-bold max-w-370 text-[clamp(2.25rem,7vw,6.5rem)] leading-[1.02] sm:leading-[0.96] tracking-[-0.04em] sm:tracking-[-0.06em]">
              {currentMessage.headline}{' '}
              <span className="text-primary">
                {currentMessage.headlineHighlight}
              </span>
            </h1>
            <p className="my-6 mt-6 md:mt-12 max-w-[53.125rem] text-base font-semibold leading-7 text-muted-foreground md:h-24 md:text-xl md:leading-9 text-center sm:text-lg sm:leading-8">
              {currentMessage.subtext}
              <span className="font-bold text-foreground">
                {currentMessage.subtextHighlight}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicator Dots */}
      {/* <div className="flex justify-center gap-2 my-8">
        {heroMessages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
            }}
            className="relative"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${
                index === currentIndex
                  ? 'bg-primary dark:bg-primary'
                  : 'bg-gray-400 dark:bg-gray-600'
              }`}
              animate={{
                scale: index === currentIndex ? [1, 1.3, 1] : 1,
                opacity: index === currentIndex ? [0.7, 1, 0.7] : 0.5,
              }}
              transition={{
                duration: 2,
                repeat: index === currentIndex ? Infinity : 0,
                ease: 'easeInOut',
              }}
            />
          </motion.button>
        ))}
      </div> */}

      {/* Decorative particles that react to changes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary/30 dark:bg-primary/50 rounded-full"
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0,
              scale: 0
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 400],
              y: [0, (Math.random() - 0.5) * 400],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: currentIndex * 0.2 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 3.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
