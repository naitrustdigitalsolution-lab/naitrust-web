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
          className="flex flex-col justify-between rounded-2xl bg-[#eef3f8] p-5 dark:bg-[#0A0E1A] sm:p-8 lg:rounded-none lg:bg-transparent lg:p-10 lg:dark:bg-transparent"
        >
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mb-12 inline-flex items-center"
              aria-label="Go to Naitrust home"
            >
              <NaitrustLogo size="postMd" showText={true} textColor={isDarkMode ? "text-white" : "text-primary"} />
            </button>

            <div className="max-w-md">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Start with the right profile
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[#0b2b45] dark:text-white sm:text-4xl">
                Create safer transactions with Naitrust.
              </h1>
              <p className="mt-4 text-base leading-7 text-[#496274] dark:text-slate-300">
                Choose how you want to use Naitrust so your setup matches the deal rooms, evidence checks, and release actions you need.
              </p>
            </div>

            <div className="mt-10 max-w-md space-y-4">
              {[
                'Shared transaction rooms before money moves',
                'Identity, business, and evidence records in one place',
                'Buyer and seller workflows built for Nigerian commerce',
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

          <div className="mt-10 text-sm leading-6 text-muted-foreground">
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
            className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:p-8"
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
                        <h3 className="text-lg font-semibold">For my personal deals</h3>
                        <Button className="rounded-full sm:mt-1" size="sm">
                          Choose Individual
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Buying from a new seller, paying a contractor, or making a high-value purchase? Create a clear record before you pay and keep the proof if anything goes wrong.
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-1">
                        {[
                          'Verify who you are dealing with',
                          'Agree price and delivery first',
                          'Follow payment and deal progress',
                          'Keep receipts, proof, and messages',
                        ].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
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
                        <h3 className="text-lg font-semibold">For my business deals</h3>
                        <Button className="rounded-full sm:mt-1" size="sm">
                          Choose Business
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                        {/* <Badge className="absolute right-4 top-4 border border-amber-300 bg-amber-100 text-amber-900 shadow-sm hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">Popular</Badge> */}
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Give customers and suppliers more confidence in your business. Verify your organisation, structure each deal, and build a record of successful transactions.
                      </p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-1">
                        {[
                          'Verify your business and representatives',
                          'Set clear terms with counterparties',
                          'Manage buyer and supplier deal rooms',
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
      </div>
    </div>
  );
}
