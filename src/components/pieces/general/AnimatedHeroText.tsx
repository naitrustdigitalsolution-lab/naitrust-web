import { motion } from 'motion/react';

/**
 * Fixed first-impression copy. The previous rotating messages made the product
 * category depend on when a visitor looked at the hero.
 */
export function AnimatedHeroText({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative min-w-0 w-full">
      <div className="grid place-items-center px-2 lg:place-items-start lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-2 flex h-auto min-w-0 w-full flex-col items-center sm:mt-4 xl:items-start"
        >
          <h1 className="naitrust-satoshi-bold w-full max-w-3xl py-2 text-center text-[clamp(1.5rem,7.6vw,2rem)] leading-[1.02] tracking-[-0.045em] text-white sm:hidden">
            <span className="block whitespace-nowrap">One account for every move</span>
            <span className="block text-[#50adff]">your money makes.</span>
          </h1>
          <h1 className={`naitrust-satoshi-bold hidden w-full max-w-3xl text-center text-[clamp(2.5rem,8vw,4.25rem)] leading-[0.96] tracking-[-0.055em] text-white sm:block md:text-[clamp(3rem,7vw,4.25rem)] xl:text-left ${compact ? 'xl:text-[clamp(2.75rem,3.5vw,4rem)]' : 'xl:text-[clamp(3.15rem,4.6vw,5rem)]'}`}>
            <span className="inline">One account for</span>{' '}
            <span className="inline">every move</span>{' '}
            <span className="block text-[#50adff]">your money makes.</span>
          </h1>
          <p className="mt-6 max-w-[29rem] text-center text-[clamp(0.625rem,2.8vw,0.75rem)] font-medium leading-5 text-white/68 sm:hidden">
            <span className="block whitespace-nowrap">Send money, receive payments, and protect important</span>
            <span className="block whitespace-nowrap">transactions, all from one trusted account for you</span>
            <span className="block">or your business.</span>
          </p>
          <p className="mt-6 hidden max-w-[34rem] text-center text-lg font-medium leading-8 text-white/68 sm:block xl:text-left">
            Send money, receive payments, and protect important transactions, all from one trusted account for you or your business.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
