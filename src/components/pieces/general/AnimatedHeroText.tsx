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
          <h1 className="naitrust-satoshi-bold w-full max-w-3xl py-2 text-center text-[clamp(1.5rem,7.6vw,3.75rem)] leading-[1.02] tracking-[-0.045em] text-white xl:hidden">
            <span className="block">Pay with confidence.</span>
            <span className="block text-[#50adff]">Know who you pay.</span>
            <span className="block text-[#50adff]">Protect your payment.</span>
          </h1>
          <h1 className="naitrust-satoshi-bold hidden w-full max-w-3xl text-left text-7xl leading-[0.94] tracking-[-0.055em] text-white xl:block">
            <span className="block">Pay with confidence.</span>
            <span className="block text-[#50adff]">Know who you pay.</span>
            <span className="block text-[#50adff]">Protect your payment.</span>
          </h1>
          <p className="mt-6 max-w-[29rem] text-center text-[clamp(0.625rem,2.8vw,0.75rem)] font-medium leading-5 text-white/68 sm:hidden">
            <span className="block">Send and receive money.</span>
            <span className="block">Verify people and businesses.</span>
            <span className="block">Use Protected Deals for important payments.</span>
          </p>
          <p className="mt-6 hidden max-w-[34rem] text-center text-lg font-medium leading-8 text-white/68 sm:block xl:text-left">
            <span className="block">Send and receive money.</span>
            <span className="block">Verify people and businesses.</span>
            <span className="block">Use Protected Deals for important payments.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
