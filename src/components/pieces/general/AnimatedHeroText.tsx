import { motion } from 'motion/react';

/**
 * Fixed first-impression copy. The previous rotating messages made the product
 * category depend on when a visitor looked at the hero.
 */
export function AnimatedHeroText() {
  return (
    <div className="relative min-w-0 w-full">
      <div className="grid place-items-center px-2 lg:place-items-start lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-2 flex h-auto min-w-0 w-full flex-col items-center sm:mt-4 xl:items-start"
        >
          <h1 className="naitrust-satoshi-bold w-full max-w-3xl text-center text-[clamp(1.55rem,7.5vw,1.9rem)] leading-[1.04] tracking-[-0.04em] text-white sm:text-[clamp(2.5rem,8vw,4.25rem)] sm:leading-[0.96] sm:tracking-[-0.055em] md:text-[clamp(3rem,7vw,4.25rem)] xl:text-left xl:text-[clamp(3.15rem,4.6vw,5rem)]">
            <span className="block sm:inline">One account for</span>{' '}
            <span className="block sm:inline">every move</span>{' '}
            <span className="block text-[#50adff]">your money makes.</span>
          </h1>
          <p className="mt-2.5 max-w-[29rem] text-center text-xs font-medium leading-[1.15rem] text-white/68 sm:mt-6 sm:max-w-[34rem] sm:text-lg sm:leading-8 xl:text-left">
            Receive, pay, and protect important transactions from one trusted account—whether you trade as a person or a business.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
