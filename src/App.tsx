import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { appConfig } from "./configs/env";
import { AuthProvider } from './libs/auth-context';
import BeBackPage from "./pages/BeBackPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { HomePage } from './components/pages/HomePage';
import SimplePage from "./pages/SimplePage";
import VerifyCodePage from "./pages/VerifyCodePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { AboutPage } from "./components/pages/AboutPage";
import { FeedbackPage } from "./components/pages/FeedbackPage";
import { HowItWorksPage } from "./components/pages/HowItWorksPage";
import { HelpCenterPage } from "./components/pages/HelpCenterPage";
import { FAQsPage } from "./components/pages/FAQsPage";
import { ContactUsPage } from "./components/pages/ContactUsPage";
import { TermsOfServicePage } from "./components/pages/TermsOfServicePage";
import { PrivacyPolicyPage } from "./components/pages/PrivacyPolicyPage";
import { VerificationPolicyPage } from "./components/pages/VerificationPolicyPage";
import { CompliancePage } from "./components/pages/CompliancePage";
import { Header } from "./components/pieces/general/Header";
import { Footer } from "./components/pieces/general/Footer";
import { CookieConsent } from "./components/utility/CookieConsent";
import { Toaster } from "./components/ui/sonner";
import { WaitlistModalHost } from "./components/modals/WaitlistModal";
import { BlogPage } from "./components/pages/BlogPage";
import { BlogArticlePage } from './components/pages/BlogArticlePage';
import { AuthPageLoader, DashboardPageLoader } from "./components/pieces/auth/AuthPageLoader";
import { UseCasesPage } from './components/pages/UseCasesPage';
import { UseCaseDetailPage } from './components/pages/UseCaseDetailPage';
import { ReportConcernPage } from './components/pages/ReportConcernPage';
import { RequireAuth } from './components/utility/RequireAuth';

/**
 * Minimum time the branded AuthPageLoader stays on screen before a lazy route
 * is revealed. Route chunks usually resolve in a few milliseconds, so without a
 * floor the preloader only flashes. This keeps it visible long enough to read.
 * Applies while the chunk loads (first visit / hard refresh); cached chunks on
 * repeat navigation render instantly. Tune this single number to taste.
 */
const MIN_PRELOADER_MS = 800;

/**
 * Like React.lazy, but the import resolves no sooner than MIN_PRELOADER_MS so
 * the Suspense fallback (AuthPageLoader) has a minimum display time.
 */
function lazyWithMinDelay<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() =>
    Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, MIN_PRELOADER_MS)),
    ]).then(([module]) => module),
  );
}

const LoginPage = lazyWithMinDelay(() => import("./pages/LoginPage"));
const SignupPage = lazyWithMinDelay(() => import("./pages/SignupPage"));
const DashboardPage = lazyWithMinDelay(() => import("./pages/DashboardPage"));
const CreateDealPage = lazyWithMinDelay(() => import("./pages/CreateDealPage"));
const DealsPage = lazyWithMinDelay(() => import("./pages/DealsPage"));
const DealDraftsPage = lazyWithMinDelay(() => import("./pages/DealDraftsPage"));
const TransactionRoomPage = lazyWithMinDelay(() => import("./pages/TransactionRoomPage"));
const InvitationsPage = lazyWithMinDelay(() => import("./pages/InvitationsPage"));
const InvitationDetailPage = lazyWithMinDelay(() => import("./pages/InvitationDetailPage"));
const NotificationsPage = lazyWithMinDelay(() => import("./pages/NotificationsPage"));
const ProfilePage = lazyWithMinDelay(() => import("./pages/ProfilePage"));
const SettingsPage = lazyWithMinDelay(() => import("./pages/SettingsPage"));
const SecurityCenterPage = lazyWithMinDelay(() => import("./pages/SecurityCenterPage"));

const queryClient = new QueryClient();

// A dashboard URL loaded directly by the browser (including refresh) gets the
// full-screen loader. Client-side navigation—even the first trip into /app from
// a public route—keeps the dashboard chrome and loads only the content panel.
let browserLoadedDashboardUrl =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/app');

function DashboardRouteSuspense({ children }: { children: ReactNode }) {
  // Read directly on every render rather than freezing via useState — this
  // wrapper is the same component type across every /app/* route, so React
  // Router updates it in place (children prop swap) instead of remounting it
  // on navigation. A useState initializer would only run once for the whole
  // session, permanently locking in whichever loader the first route saw.
  const useFullScreenLoader = browserLoadedDashboardUrl;

  useEffect(() => {
    browserLoadedDashboardUrl = false;
  }, []);

  return (
    <Suspense fallback={useFullScreenLoader ? <AuthPageLoader /> : <DashboardPageLoader />}>
      {children}
    </Suspense>
  );
}

const simplePages: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
  }
> = {
  "/business": {
    eyebrow: "For businesses",
    title: "Help customers and partners trust you before money moves.",
    description:
      "Naitrust gives honest suppliers, contractors, vendors, and service providers a structured way to prove reliability.",
    points: ["Verified profile", "Safe deal rooms", "Evidence trail", "Reputation history"],
  },
  "/resources": {
    eyebrow: "Resources",
    title: "Guides for safer Nigerian transactions.",
    description:
      "Learn how to use Naitrust for safe deal rooms, verification, protected funding through regulated partners, delivery evidence, and issue reporting.",
    points: ["How safe deals work", "Buyer and seller checklists", "Dispute evidence", "Verification guide"],
  },
};

const pagePaths: Record<string, string> = {
  home: "/",
  about: "/about",
  "how-it-works": "/how-it-works",
  "use-cases": "/use-cases",
  pricing: "/",
  business: "/business",
  resources: "/resources",
  blog: "/blog",
  help: "/help",
  faqs: "/faqs",
  "report-concern": "/report-concern",
  "report-fraud": "/report-concern",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  "verification-policy": "/verification-policy",
  compliance: "/compliance",
  login: "/login",
  register: "/register",
  "register-business": "/register-business",
  "register-customer": "/register-customer",
  "forgot-password": "/forgot-password",
  "verify-code": "/verify-code",
  "verify-email": "/verify-email",
  feedback: "/feedback",
  search: "/",
};

const standalonePaths = [
  "/login",
  "/register",
  "/register-business",
  "/register-customer",
  "/forgot-password",
  "/verify-code",
  "/verify-email",
  "/app",
];

function getCurrentPage(pathname: string) {
  if (pathname === "/") return "home";
  return pathname.replace("/", "") || "home";
}

function ScrollToRoutePosition() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(location.hash)?.scrollIntoView({ block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return null;
}

function SimpleRoutePage() {
  const location = useLocation();
  const page = simplePages[location.pathname];

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return <SimplePage {...page} />;
}

function PublicAppContent() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const currentPage = getCurrentPage(location.pathname);
  const usesStandaloneHome =
    standalonePaths.includes(location.pathname) || location.pathname.startsWith("/app");

  const handleNavigate = (page: string) => {
    routerNavigate(pagePaths[page] ?? page);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <ScrollToRoutePosition />
      {!usesStandaloneHome && <Header onNavigate={handleNavigate} currentPage={currentPage} />}

      <main>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/about" element={<AboutPage onNavigate={handleNavigate} />} />
          <Route path="/feedback" element={<FeedbackPage onNavigate={handleNavigate} />} />
          <Route path="/how-it-works" element={<HowItWorksPage onNavigate={handleNavigate} />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/use-cases/:slug" element={<UseCaseDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/help" element={<HelpCenterPage onNavigate={handleNavigate} />} />
          <Route path="/faqs" element={<FAQsPage onNavigate={handleNavigate} />} />
          <Route path="/contact" element={<ContactUsPage onNavigate={handleNavigate} />} />
          <Route path="/report-concern" element={<ReportConcernPage onNavigate={handleNavigate} />} />
          <Route path="/terms" element={<TermsOfServicePage onNavigate={handleNavigate} />} />
          <Route path="/privacy" element={<PrivacyPolicyPage onNavigate={handleNavigate} />} />
          <Route path="/verification-policy" element={<VerificationPolicyPage onNavigate={handleNavigate} />} />
          <Route path="/compliance" element={<CompliancePage onNavigate={handleNavigate} />} />
          <Route path="/pricing" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Suspense fallback={<AuthPageLoader />}><LoginPage /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<AuthPageLoader />}><SignupPage /></Suspense>} />
          <Route path="/register-business" element={<Suspense fallback={<AuthPageLoader />}><SignupPage initialType="business" /></Suspense>} />
          <Route path="/register-customer" element={<Suspense fallback={<AuthPageLoader />}><SignupPage initialType="customer" /></Suspense>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<DashboardRouteSuspense><DashboardPage /></DashboardRouteSuspense>} />
            <Route path="/app/deals" element={<DashboardRouteSuspense><DealsPage /></DashboardRouteSuspense>} />
            <Route path="/app/deals/new" element={<DashboardRouteSuspense><CreateDealPage /></DashboardRouteSuspense>} />
            <Route path="/app/drafts" element={<DashboardRouteSuspense><DealDraftsPage /></DashboardRouteSuspense>} />
            <Route path="/app/deals/:id" element={<DashboardRouteSuspense><TransactionRoomPage /></DashboardRouteSuspense>} />
            <Route path="/app/invitations" element={<DashboardRouteSuspense><InvitationsPage /></DashboardRouteSuspense>} />
            <Route path="/app/invitations/:id" element={<DashboardRouteSuspense><InvitationDetailPage /></DashboardRouteSuspense>} />
            <Route path="/app/notifications" element={<DashboardRouteSuspense><NotificationsPage /></DashboardRouteSuspense>} />
            <Route path="/app/profile" element={<DashboardRouteSuspense><ProfilePage /></DashboardRouteSuspense>} />
            <Route path="/app/settings" element={<DashboardRouteSuspense><SettingsPage /></DashboardRouteSuspense>} />
            <Route path="/app/security" element={<DashboardRouteSuspense><SecurityCenterPage /></DashboardRouteSuspense>} />
          </Route>
          <Route path="/business" element={<SimpleRoutePage />} />
          <Route path="/resources" element={<SimpleRoutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!usesStandaloneHome && <Footer onNavigate={handleNavigate} />}
      <CookieConsent />
      <WaitlistModalHost />
      <Toaster />
    </div>
  );
}

function App() {
  if (appConfig.pagePhase === "coming-soon") {
    return <ComingSoonPage />;
  }

  if (appConfig.pagePhase === "be-back") {
    return <BeBackPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <PublicAppContent />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
