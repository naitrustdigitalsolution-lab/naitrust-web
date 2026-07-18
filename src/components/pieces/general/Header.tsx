import { useState } from 'react';
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
    { label: 'How It Works', page: 'how-it-works' },
    { label: 'Real Estate', page: 'use-cases' },
    { label: 'Blog', page: 'blog' },
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
      {!isAuthenticated && showNavItems && (
          <button
            type="button"
            onClick={openWaitlistModal}
            className="w-full bg-primary/10 px-4 min-h-14 py-2 text-center text-sm font-medium text-[#0b2b45] transition hover:bg-primary/15 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#1a1a1a]/80"
          >
            <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className='text-black dark:text-white text-xs sm:text-sm md:text-lg'>Naitrust is coming soon — trust infrastructure for clearer Nigerian property transactions.</span>
              <span className="inline-flex items-center gap-1 text-primary text-xs sm:text-sm md:text-lg font-semibold">
                Join the waiting list
                <ArrowRight size={15} />
              </span>
            </span>
          </button>
        )}
      <header className="sticky top-0 z-40 bg-background/95 text-foreground">
        <div className="border-b border-border shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/80">
          <div className="relative flex h-20 min-w-0 items-center gap-4 max-w-440 mx-auto px-3 sm:px-6 lg:px-8">
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
                  className="shrink-0 items-center gap-2 transition-opacity hover:opacity-80 md:flex"
                >
                  <NaitrustLogo size="md" showText={true} />
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
                <NaitrustLogo size="postMd" showText={true} textColor={isDarkMode ? "text-white" : "text-primary"} />
              </button>
            )}

            {/* Desktop Navigation - Only show when showNavItems is true and not authenticated, centered */}
            {showNavItems && !isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                {publicNavItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`transition-colors whitespace-nowrap ${
                      currentPage === item.page
                        ? 'text-primary font-medium'
                        : 'text-foreground hover:text-[#1e90ff]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
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
                className="rounded-full w-9 h-9 p-0"
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
                  className="lg:hidden p-2 hover:bg-muted rounded-lg"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}

              {/* Unauthenticated: Desktop login/signup */}
              {!isAuthenticated && showNavItems && (
                <div className="hidden lg:flex items-center gap-2">
                  <Button variant="outline" size="lg" onClick={() => window.open('/login', '_blank', 'noopener,noreferrer')}>
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
              className="lg:hidden border-t border-border bg-background overflow-hidden w-full md:w-1/2 absolute right-0 top-[7.25rem] rounded-bl-lg shadow-lg z-50 backdrop-blur-md supports-backdrop-filter:bg-background/80"
            >
              <div className="px-4 py-4 space-y-2">
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
                        : 'hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="pt-3 border-t border-border flex w-full gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-0"
                    onClick={() => {
                      window.open('/login', '_blank', 'noopener,noreferrer');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="flex-1 min-w-0"
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
