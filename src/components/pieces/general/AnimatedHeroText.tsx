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
          <h1 className="naitrust-satoshi-bold max-w-3xl lg:max-w-2xl text-center text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.12] tracking-[-0.04em] sm:leading-[1.08] sm:tracking-[-0.06em] lg:text-left lg:text-[clamp(2.75rem,3.6vw,4.25rem)]">
            Buy Property with{' '}
            <span className="text-primary">Greater Confidence.</span>
          </h1>
          <p className="my-6 mt-6 max-w-[25rem] sm:max-w-[36rem] md:max-w-[36rem] lg:max-w-[46rem] text-center text-base font-semibold leading-7 text-muted-foreground sm:text-lg sm:leading-8 md:mt-8 md:leading-9 lg:text-left">
            Property transactions involve large payments, multiple parties, scattered documents, and
            too much uncertainty. Naitrust doesn't just record the deal —{' '}
            <span className="font-bold text-foreground">it protects your payment and sees it through to completion.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
