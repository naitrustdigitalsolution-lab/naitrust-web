import { Building, User, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { RegistrationPage } from './RegistrationPage';
import { useTheme } from '@/hooks/useTheme';
import spiralBackground from '../../assets/spiral.svg';

interface OnboardingPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialType?: 'choice' | 'business' | 'customer';
}

const smoothPageFade = { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const };

export function OnboardingPage({ onNavigate, initialType = 'choice' }: OnboardingPageProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  if (initialType === 'business') {
    return <RegistrationPage onNavigate={onNavigate} registrationType="business" />;
  }

  if (initialType === 'customer') {
    return <RegistrationPage onNavigate={onNavigate} registrationType="customer" />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-foreground dark:bg-background">
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-[#eef3f8] dark:bg-[#0A0E1A] lg:block" />
       <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8 ">
          <img
            src={spiralBackground}
            alt=""
            aria-hidden="true"
            className="absolute left-4 top-1/2 bottom-0 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 rotate-180 opacity-100 sm:left-6 lg:left-8"
          />
        </div>
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={smoothPageFade}
          className="hidden lg:flex flex-col justify-between rounded-2xl bg-[#eef3f8] p-5 dark:bg-[#0A0E1A] sm:p-8 lg:rounded-none lg:bg-transparent lg:p-10 lg:dark:bg-transparent"
        >
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mb-6 inline-flex items-center lg:mb-12"
              aria-label="Go to Naitrust home"
            >
              <NaitrustLogo size="postMd" showText={true} textColor={isDarkMode ? "text-white" : "text-primary"} />
            </button>

            <div className="max-w-md">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
                Start with the right profile
              </p>
              <h1 className="text-2xl font-bold leading-tight text-[#0b2b45] dark:text-white sm:text-3xl lg:text-4xl">
                Create clearer property transactions with Naitrust.
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#496274] dark:text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
                Choose how you participate in property transactions so your profile and transaction guidance fit your needs.
              </p>
            </div>

            {/* Desktop only — on mobile these bullets move BELOW the choice cards. */}
            <div className="mt-10 hidden max-w-md space-y-4 lg:block">
              {[
                'Shared transaction rooms before money moves',
                'Identity, business, and evidence records in one place',
                'Property workflows built for buyers, sellers, agents, and companies',
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-xl border border-white/70 bg-white/70 dark:bg-card dark:text-slate-300 p-4 text-sm leading-6 text-muted-foreground shadow-sm dark:border-white/10"
                >
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 hidden text-sm leading-6 text-muted-foreground lg:block">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-semibold text-primary hover:underline"
            >
              Login
            </button>
          </div>
        </motion.aside>

        <main className="flex min-h-full items-center justify-center py-4 lg:py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...smoothPageFade, delay: 0.1 }}
            className="w-full max-w-2xl sm:rounded-2xl sm:border sm:border-border/70 bg-card sm:p-5 sm:shadow-2xl sm:p-8"
          >
            <div className="mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
                <User size={28} />
              </div>
              <p className="mb-2 text-sm font-semibold text-primary">Profile setup</p>
              <h2 className="text-2xl font-bold">How do you want to use Naitrust?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose the profile that best fits how you transact today. You can add more capabilities later from your dashboard.
              </p>
            </div>

            <div className="grid gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...smoothPageFade, delay: 0.12 }}
              >
                <Card
                  className="h-full cursor-pointer border-border/70 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl sm:p-6"
                  onClick={() => onNavigate('register-customer')}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-full bg-accent text-blue-600">
                      <User size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <h3 className="text-lg lg:text-md xl:text-lg font-semibold">As a property buyer or seller</h3>
                        <Button className="rounded-full sm:mt-1 text-xs" size="sm">
                          Choose Individual
                          <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm lg:text-xs xl:text-sm leading-6 text-muted-foreground">
                        Buying or selling property? Create a clear record of the property, participants, terms, payments, documents, milestones, and supporting evidence.
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-1">
                        {[
                          'Verify who you are dealing with',
                          'Record the property, price, and payment plan',
                          'Follow payments and transaction milestones',
                          'Keep receipts, documents, evidence, and messages',
                        ].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm lg:text-xs xl:text-sm text-muted-foreground">
                            <CheckCircle size={15} className="shrink-0 text-blue-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                   
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...smoothPageFade, delay: 0.18 }}
              >
                <Card
                  className="h-full relative cursor-pointer border-border/70 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl sm:p-6"
                  onClick={() => onNavigate('register-business')}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                      <Building size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <h3 className="text-lg font-semibold">As a property business or professional</h3>
                        <Button className="rounded-full sm:mt-1 text-xs" size="sm">
                          Choose Business
                          <ArrowRight size={16} className="ml-1" />
                        </Button>
                      </div>
                        {/* <Badge className="absolute right-4 top-4 border border-amber-300 bg-amber-100 text-amber-900 shadow-sm hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">Popular</Badge> */}
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Give property clients a professional experience. Verify your organisation or role, structure each transaction, and build a history of completed activity.
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-1">
                        {[
                          'Verify your business and representatives',
                          'Set clear property transaction terms',
                          'Manage buyer, seller, agent, and developer records',
                          'Build portable transaction reputation',
                        ].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle size={15} className="shrink-0 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-3 text-center text-xs leading-5 text-muted-foreground">
              Individuals and businesses can both pay, receive, and complete transactions. Choose the profile that matches how you want records and reputation to appear.
            </div>
          </motion.div>
        </main>

        {/* Mobile: supporting points + login link sit BELOW the choice cards. */}
        <section className="lg:hidden">
          {[
            'Shared transaction rooms before money moves',
            'Identity, business, and evidence records in one place',
            'Property workflows built for Nigerian buyers and businesses',
          ].map((item) => (
            <div
              key={item}
              className="flex hidden gap-3 rounded-xl border border-border/70 bg-background/70 p-3 text-sm leading-5 text-muted-foreground shadow-sm dark:bg-card"
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>{item}</span>
            </div>
          ))}
          <p className="text-center text-sm leading-6 text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-semibold text-primary hover:underline"
            >
              Login
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
