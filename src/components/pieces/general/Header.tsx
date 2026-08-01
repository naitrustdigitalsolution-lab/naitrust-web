import { useEffect, useState } from 'react';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { useAuth } from '../../../libs/auth-context';
import { useBusinessStore } from '../../../libs/store/business.store';
import { Button } from '../../ui/button';
import { User, LogOut, Menu, X, Sun, Moon, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { openWaitlistModal } from '../../modals/WaitlistModal';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  showNavItems?: boolean; // Show navigation items only when sidebar is not active
}

export function Header({ onNavigate, currentPage, showNavItems = true }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { currentBusiness } = useBusinessStore();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  // On the homepage, the header floats transparently over the hero photo
  // until the user scrolls past it, then becomes a normal solid header.
  const isHomeHero = currentPage === 'home' && !isScrolled;

  useEffect(() => {
    if (currentPage !== 'home') return;
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage]);

  // Pages that should show back button (2 screens deep)
  const backButtonPages = ['business-profile', 'chat', 'cac-verification', 'upgrade-tier'];
  const shouldShowBackButton = !showNavItems && backButtonPages.includes(currentPage);
  
  // Determine back navigation target
  const handleBack = () => {
    if (currentPage === 'business-profile') {
      onNavigate('search');
    } else if (currentPage === 'chat') {
      if (user?.role === 'customer') {
        onNavigate('customer-inbox');
      } else if (user?.role === 'business') {
        onNavigate('business-inbox');
      } else {
        onNavigate('admin-inbox');
      }
    } else {
      routerNavigate(-1);
    }
  };

  // Nav items for unauthenticated users (public pages)
  const publicNavItems = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  // Determine where logo should navigate
  const handleLogoClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'customer') {
        onNavigate('customer-dashboard');
      } else if (user?.role === 'business') {
        onNavigate('business-dashboard');
      } else if (user?.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('home');
      }
    } else {
      onNavigate('home');
    }
  };

  return (
    <>
      {!isAuthenticated && showNavItems && currentPage !== 'home' && (
          <button
            type="button"
            onClick={openWaitlistModal}
            className="hidden w-full min-h-14 bg-primary/10 px-4 py-2 text-center text-sm font-medium text-[#0b2b45] transition hover:bg-primary/15 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#1a1a1a]/80 sm:block"
          >
            <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className='text-sm text-black dark:text-white md:text-base'>Built for everyday Nigerian business payments.</span>
              <span className="inline-flex items-center gap-1 text-primary text-xs sm:text-sm md:text-lg font-semibold">
                Join the waiting list
                <ArrowRight size={15} />
              </span>
            </span>
          </button>
        )}
      <header
        className={`z-40 transition-[background-color,color,box-shadow,backdrop-filter] duration-500 ease-out ${
          currentPage === 'home'
            ? `fixed inset-x-0 top-0 ${isHomeHero ? 'bg-transparent text-white' : 'bg-background/88 text-foreground shadow-[0_10px_35px_rgba(3,19,53,.08)] backdrop-blur-xl'}`
            : 'sticky top-0 bg-background/95 text-foreground'
        }`}
      >
        <div
          className={`transition-[border-color] duration-500 ${
            isHomeHero
              ? 'border-b border-transparent'
              : 'border-b border-border/70'
          }`}
        >
          <div className="relative mx-auto flex h-16 min-w-0 max-w-440 items-center gap-3 px-3 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
            {/* Back Button - Show for pages 2 screens deep when sidebar is active (desktop) */}
            {shouldShowBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 shrink-0 hidden md:flex"
              >
                <ArrowLeft size={18} />
                Back
              </Button>
            )}

            {/* Mobile: Back button or Logo */}
            <div className="lg:hidden flex items-center">
              {shouldShowBackButton ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1 shrink-0 -ml-2"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Back</span>
                </Button>
              ) : (
                <button
                  onClick={handleLogoClick}
                  className="flex shrink-0 items-center gap-1.5 transition-opacity hover:opacity-80"
                >
                  <NaitrustLogo
                    size="sm"
                    showText
                    textColor={isHomeHero ? 'text-white' : 'text-primary'}
                    className="gap-1.5 [&>div]:h-7 [&>div]:w-7 [&>span]:text-base sm:gap-2 sm:[&>div]:h-8 sm:[&>div]:w-8 sm:[&>span]:text-lg"
                  />
                </button>
              )}
            </div>
            
            {/* Desktop: Logo - Only show when showNavItems is true (when sidebar is not active) */}
            {showNavItems && (
              <button
                onClick={handleLogoClick}
                id="logo-export"
                className="hidden lg:flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <NaitrustLogo size="postMd" showText={true} textColor={isHomeHero || isDarkMode ? "text-white" : "text-primary"} />
              </button>
            )}

            {/* Desktop public navigation is visually centred between brand and actions. */}
            {showNavItems && !isAuthenticated && (
              <motion.nav
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex"
              >
                {publicNavItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`relative whitespace-nowrap transition-colors duration-300 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-[width] after:duration-300 ${
                      isHomeHero
                        ? currentPage === item.page
                          ? 'font-medium text-white after:w-full'
                          : 'text-white/75 after:w-0 hover:text-white hover:after:w-full'
                        : currentPage === item.page
                          ? 'font-medium text-primary after:w-full'
                          : 'text-foreground after:w-0 hover:text-[#1e90ff] hover:after:w-full'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </motion.nav>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Desktop: User/Business Info - Show when authenticated */}
              {isAuthenticated && currentPage !== 'business-profile' && (
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-lg">
                  {user?.role === 'business' && currentBusiness ? (
                    <>
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs font-medium truncate max-w-[150px]">{user.firstName + ' ' + user.lastName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User size={14} className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs font-medium truncate max-w-[150px]">{user.firstName + ' ' + user.lastName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`rounded-full w-9 h-9 p-0 ${isHomeHero ? 'text-white hover:bg-white/10 hover:text-white' : ''}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>

              {/* Notifications - Always show when authenticated */}

              {/* Desktop only: Logout button when sidebar is not showing nav */}
              {isAuthenticated && showNavItems && (
                <Button variant="outline" size="lg" onClick={() => { logout(); onNavigate('login'); }} className="hidden md:flex">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              )}

              {/* Unauthenticated: Mobile hamburger menu */}
              {!isAuthenticated && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={mobileMenuOpen}
                  className={`rounded-lg p-1.5 lg:hidden ${isHomeHero ? 'text-white hover:bg-white/10' : 'hover:bg-muted'} ${mobileMenuOpen ? 'bg-primary/15' : ''}`}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}

              {/* Unauthenticated: Desktop login/signup */}
              {!isAuthenticated && showNavItems && (
                <div className="hidden lg:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('/login', '_blank', 'noopener,noreferrer')}
                    className={isHomeHero ? 'border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white' : ''}
                  >
                    Login
                  </Button>
                  <Button size="lg" onClick={() => window.open('/register', '_blank', 'noopener,noreferrer')}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu - ONLY for unauthenticated users */}
        <AnimatePresence>
          {!isAuthenticated && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute right-0 top-full z-50 w-full overflow-hidden border-t border-white/10 bg-[#071b31] text-white shadow-[0_22px_55px_rgba(3,19,53,.35)] sm:w-96 sm:rounded-bl-2xl lg:hidden"
            >
              <div className="space-y-1.5 px-4 py-4">
                {publicNavItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                      currentPage === item.page
                        ? 'bg-primary text-white'
                        : 'text-white/78 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="mt-3 flex w-full gap-2 border-t border-white/10 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 min-w-0 flex-1 border-white/25 bg-white/[0.06] text-xs text-white hover:bg-white/12 hover:text-white"
                    onClick={() => {
                      window.open('/login', '_blank', 'noopener,noreferrer');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 min-w-0 flex-1 text-xs"
                    onClick={() => {
                      window.open('/register', '_blank', 'noopener,noreferrer');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
