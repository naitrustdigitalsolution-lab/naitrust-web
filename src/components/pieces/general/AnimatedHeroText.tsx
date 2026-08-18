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
          className="mt-2 flex h-auto min-w-0 w-full flex-col items-center sm:mt-3 xl:items-start"
        >
          <h1 className="naitrust-satoshi-bold w-full max-w-3xl py-2 text-center text-[clamp(2.05rem,9.5vw,3.75rem)] leading-[1.02] tracking-[-0.045em] text-white xl:hidden">
            Wholesale sourcing, <span className="text-[#50adff]">organized from supplier to delivery.</span>
          </h1>
          <h1 className="naitrust-satoshi-bold hidden w-full max-w-3xl text-left text-[clamp(3.2rem,5.2vw,4.8rem)] leading-[0.98] tracking-[-0.05em] text-white xl:block">
            Wholesale sourcing, <span className="text-[#50adff]">organized from supplier to delivery.</span>
          </h1>
          <p className="mt-6 max-w-[29rem] text-center text-[clamp(0.625rem,2.8vw,0.75rem)] font-medium leading-5 text-white/68 sm:hidden">
            Find products in China or Nigeria, verify suppliers, follow inspections, understand the full cost, and coordinate delivery.
          </p>
          <p className="mt-5 hidden max-w-[42rem] text-center text-base font-medium leading-7 text-white/72 sm:block xl:text-left 2xl:text-lg 2xl:leading-8">
            Find products in China or Nigeria, verify the supplier, follow sourcing and inspection evidence, understand the full cost, and coordinate delivery in one place.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
