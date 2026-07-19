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
          <h1 className="naitrust-satoshi-bold max-w-370 text-center text-[clamp(2.25rem,7vw,6.5rem)] leading-[1.12] tracking-[-0.04em] sm:leading-[1.08] sm:tracking-[-0.06em] lg:text-left lg:text-[clamp(58px,4.3vw,78px)]">
            Buy Property with{' '}
            <span className="text-primary">Greater Confidence.</span>
          </h1>
          <p className="my-6 mt-6 max-w-[46rem] text-center test-sm md:text-base font-semibold leading-7 text-muted-foreground sm:text-lg sm:leading-8 md:mt-8 md:leading-9 lg:text-left">
            Naitrust is a property transaction platform for buyers, sellers, agents, developers, and
            real estate companies to record agreements, payments, property documents, and milestones{' '}
            <span className="font-bold text-foreground">in one trusted place.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
