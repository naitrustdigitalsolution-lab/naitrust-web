import { motion } from 'motion/react';

/**
 * Fixed first-impression copy. The previous rotating messages made the product
 * category depend on when a visitor looked at the hero.
 */
export function AnimatedHeroText() {
  return (
    <div className="relative">
      <div className="grid place-items-center px-2 lg:place-items-start lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-4 flex h-auto flex-col items-center lg:items-start"
        >
          <h1 className="naitrust-satoshi-bold max-w-3xl text-center text-[clamp(2.65rem,8vw,4.25rem)] leading-[0.98] tracking-[-0.065em] text-white sm:leading-[0.96] lg:text-left lg:text-[clamp(3.15rem,4.6vw,5rem)]">
            One account for every move{' '}
            <span className="text-[#50adff]">your business makes.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-center text-base font-medium leading-7 text-white/68 sm:text-lg sm:leading-8 lg:text-left">
            Receive sales, pay suppliers, and protect important orders—all from one verified business account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
