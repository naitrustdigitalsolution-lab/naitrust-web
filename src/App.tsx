import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { appConfig } from "./configs/env";
import { AuthProvider } from './libs/auth-context';
import { useAuth } from './libs/auth-context';
import BeBackPage from "./pages/BeBackPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import { HomePage } from './components/pages/HomePage';
import SimplePage from "./pages/SimplePage";
import { Header } from "./components/pieces/general/Header";
import { Footer } from "./components/pieces/general/Footer";
import { CookieConsent } from "./components/utility/CookieConsent";
import { Toaster } from "./components/ui/sonner";
import { AuthPageLoader, DashboardPageLoader } from "./components/pieces/auth/AuthPageLoader";
import { RequireAuth } from './components/utility/RequireAuth';
import { RequireBusinessAccount } from './components/utility/RequireBusinessAccount';

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
const DeliveryHandoverPage = lazyWithMinDelay(() => import("./pages/DeliveryHandoverPage"));
const InvitationsPage = lazyWithMinDelay(() => import("./pages/InvitationsPage"));
const InvitationDetailPage = lazyWithMinDelay(() => import("./pages/InvitationDetailPage"));
const NotificationsPage = lazyWithMinDelay(() => import("./pages/NotificationsPage"));
const MessagesPage = lazyWithMinDelay(() => import("./pages/MessagesPage"));
const SupportChatPage = lazyWithMinDelay(() => import("./pages/SupportChatPage"));
const SupportRequestPage = lazyWithMinDelay(() => import("./pages/SupportRequestPage"));
const SettingsPage = lazyWithMinDelay(() => import("./pages/SettingsPage"));
const SecurityCenterPage = lazyWithMinDelay(() => import("./pages/SecurityCenterPage"));
const PaymentsHubPage = lazyWithMinDelay(() => import("./pages/PaymentsHubPage"));
const SendInstantlyPage = lazyWithMinDelay(() => import("./pages/SendInstantlyPage"));
const ReceiveMoneyPage = lazyWithMinDelay(() => import("./pages/ReceiveMoneyPage"));
const BeneficiariesPage = lazyWithMinDelay(() => import("./pages/BeneficiariesPage"));
const PaymentRequestsPage = lazyWithMinDelay(() => import("./pages/PaymentRequestsPage"));
const TransactionsPage = lazyWithMinDelay(() => import("./pages/TransactionsPage"));
const BusinessNetworkPage = lazyWithMinDelay(() => import("./pages/BusinessNetworkPage"));
const BusinessDiscoveryPage = lazyWithMinDelay(() => import("./pages/BusinessDiscoveryPage"));
const TrustProfilePage = lazyWithMinDelay(() => import("./pages/TrustProfilePage"));

// Public pages outside the landing-page critical path load only when visited.
// This keeps their forms, article data and policy content out of the mobile
// homepage bundle.
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const VerifyCodePage = lazy(() => import("./pages/VerifyCodePage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const AboutPage = lazy(() => import("./components/pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const FeedbackPage = lazy(() => import("./components/pages/FeedbackPage").then((module) => ({ default: module.FeedbackPage })));
const HelpCenterPage = lazy(() => import("./components/pages/HelpCenterPage").then((module) => ({ default: module.HelpCenterPage })));
const FAQsPage = lazy(() => import("./components/pages/FAQsPage").then((module) => ({ default: module.FAQsPage })));
const ContactUsPage = lazy(() => import("./components/pages/ContactUsPage").then((module) => ({ default: module.ContactUsPage })));
const TermsOfServicePage = lazy(() => import("./components/pages/TermsOfServicePage").then((module) => ({ default: module.TermsOfServicePage })));
const PrivacyPolicyPage = lazy(() => import("./components/pages/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })));
const VerificationPolicyPage = lazy(() => import("./components/pages/VerificationPolicyPage").then((module) => ({ default: module.VerificationPolicyPage })));
const CompliancePage = lazy(() => import("./components/pages/CompliancePage").then((module) => ({ default: module.CompliancePage })));
const BlogPage = lazy(() => import("./components/pages/BlogPage").then((module) => ({ default: module.BlogPage })));
const BlogArticlePage = lazy(() => import("./components/pages/BlogArticlePage").then((module) => ({ default: module.BlogArticlePage })));
const ReportConcernPage = lazy(() => import("./components/pages/ReportConcernPage").then((module) => ({ default: module.ReportConcernPage })));
const PublicBusinessPaymentPage = lazy(() => import("./components/pages/PublicBusinessPaymentPage").then((module) => ({ default: module.PublicBusinessPaymentPage })));
const PublicTrustProfilePage = lazy(() => import("./components/pages/PublicTrustProfilePage").then((module) => ({ default: module.PublicTrustProfilePage })));
const PublicInvitationPreviewPage = lazy(() => import("./components/pages/PublicInvitationPreviewPage").then((module) => ({ default: module.PublicInvitationPreviewPage })));
const WaitlistPage = lazy(() => import("./pages/WaitlistPage"));

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
    title: "Business payments built to earn customer confidence.",
    description:
      "Receive payments, show customers who they are dealing with, pay suppliers, and protect important customer or B2B transactions with Naitrust.",
    points: ["Business verification", "Customer payment links", "Protected Transactions", "Supplier payments"],
  },
  "/resources": {
    eyebrow: "Resources",
    title: "Practical guides for confident Nigerian payments.",
    description:
      "Learn how to check who you are dealing with, make everyday payments, use trusted payment links, and protect important transactions on Naitrust.",
    points: ["How Protected Transactions work", "Buyer and seller checklists", "Payment and delivery evidence", "Verification guide"],
  },
};

const pagePaths: Record<string, string> = {
  home: "/",
  about: "/about",
  "how-it-works": "/",
  "use-cases": "/",
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
  "/waitlist",
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
  const { isAuthenticated, isHydrated } = useAuth();
  const currentPage = getCurrentPage(location.pathname);

  useEffect(() => {
    const root = document.documentElement;
    if (!location.pathname.startsWith('/app')) {
      root.classList.remove('dark');
      return;
    }
    root.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
  }, [location.pathname]);

  // Resolve persisted auth before rendering any route. Once authenticated,
  // every URL outside the private app returns to the dashboard. Keeping this
  // check above the route tree prevents public-page flashes on refresh too.
  if (!isHydrated) {
    return <DashboardPageLoader />;
  }

  const isShareableTransactionRoute =
    location.pathname.startsWith('/pay/') ||
    location.pathname.startsWith('/invite/') ||
    location.pathname.startsWith('/trust/') ||
    location.pathname.startsWith('/delivery/');

  if (isAuthenticated && !location.pathname.startsWith('/app') && !isShareableTransactionRoute) {
    return <Navigate to="/app" replace />;
  }

  const usesStandaloneHome =
    standalonePaths.includes(location.pathname) ||
    location.pathname.startsWith("/app") ||
    location.pathname.startsWith("/pay/") ||
    location.pathname.startsWith("/trust/") ||
    location.pathname.startsWith("/invite/") ||
    location.pathname.startsWith("/delivery/") ||
    (location.pathname === "/" && (!isHydrated || isAuthenticated));

  const handleNavigate = (page: string) => {
    routerNavigate(pagePaths[page] ?? page);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <ScrollToRoutePosition />
      {!usesStandaloneHome && <Header onNavigate={handleNavigate} currentPage={currentPage} />}

      <main>
        <Suspense fallback={<AuthPageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage onNavigate={handleNavigate} />
            }
          />
          <Route path="/about" element={<AboutPage onNavigate={handleNavigate} />} />
          <Route path="/feedback" element={<FeedbackPage onNavigate={handleNavigate} />} />
          <Route path="/how-it-works" element={<Navigate to="/" replace />} />
          <Route path="/use-cases" element={<Navigate to="/" replace />} />
          <Route path="/use-cases/:slug" element={<Navigate to="/" replace />} />
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
          <Route path="/waitlist" element={<WaitlistPage />} />
          <Route path="/pay/:businessSlug" element={<PublicBusinessPaymentPage />} />
          <Route path="/trust/:businessSlug" element={<PublicTrustProfilePage />} />
          <Route path="/invite/:token" element={<PublicInvitationPreviewPage />} />
          <Route path="/delivery/:token" element={<DeliveryHandoverPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<DashboardRouteSuspense><DashboardPage /></DashboardRouteSuspense>} />
            <Route path="/app/deals" element={<DashboardRouteSuspense><DealsPage /></DashboardRouteSuspense>} />
            <Route path="/app/deals/new" element={<DashboardRouteSuspense><CreateDealPage /></DashboardRouteSuspense>} />
            <Route path="/app/drafts" element={<DashboardRouteSuspense><DealDraftsPage /></DashboardRouteSuspense>} />
            <Route path="/app/deals/:id" element={<DashboardRouteSuspense><TransactionRoomPage /></DashboardRouteSuspense>} />
            <Route path="/app/invitations" element={<DashboardRouteSuspense><InvitationsPage /></DashboardRouteSuspense>} />
            <Route path="/app/invitations/:id" element={<DashboardRouteSuspense><InvitationDetailPage /></DashboardRouteSuspense>} />
            <Route path="/app/notifications" element={<DashboardRouteSuspense><NotificationsPage /></DashboardRouteSuspense>} />
            <Route path="/app/messages" element={<DashboardRouteSuspense><MessagesPage /></DashboardRouteSuspense>} />
            <Route path="/app/messages/support" element={<DashboardRouteSuspense><SupportChatPage /></DashboardRouteSuspense>} />
            <Route path="/app/support/new" element={<DashboardRouteSuspense><SupportRequestPage /></DashboardRouteSuspense>} />
            <Route path="/app/profile" element={<Navigate to="/app/settings" replace />} />
            <Route path="/app/settings" element={<DashboardRouteSuspense><SettingsPage /></DashboardRouteSuspense>} />
            <Route path="/app/security" element={<DashboardRouteSuspense><SecurityCenterPage /></DashboardRouteSuspense>} />
            <Route path="/app/wallet" element={<Navigate to="/app/payments/send" replace />} />
            <Route path="/app/payments" element={<DashboardRouteSuspense><PaymentsHubPage /></DashboardRouteSuspense>} />
            <Route path="/app/payments/send" element={<DashboardRouteSuspense><SendInstantlyPage /></DashboardRouteSuspense>} />
            <Route path="/app/payments/receive" element={<DashboardRouteSuspense><ReceiveMoneyPage /></DashboardRouteSuspense>} />
            <Route path="/app/payments/beneficiaries" element={<RequireBusinessAccount><DashboardRouteSuspense><BeneficiariesPage /></DashboardRouteSuspense></RequireBusinessAccount>} />
            <Route path="/app/payments/requests" element={<RequireBusinessAccount><DashboardRouteSuspense><PaymentRequestsPage /></DashboardRouteSuspense></RequireBusinessAccount>} />
            <Route path="/app/transactions" element={<DashboardRouteSuspense><TransactionsPage /></DashboardRouteSuspense>} />
            <Route path="/app/network" element={<RequireBusinessAccount><DashboardRouteSuspense><BusinessNetworkPage /></DashboardRouteSuspense></RequireBusinessAccount>} />
            <Route path="/app/trust-profile" element={<RequireBusinessAccount><DashboardRouteSuspense><TrustProfilePage /></DashboardRouteSuspense></RequireBusinessAccount>} />
            <Route path="/app/businesses" element={<DashboardRouteSuspense><BusinessDiscoveryPage /></DashboardRouteSuspense>} />
            <Route path="/app/businesses/:businessId" element={<DashboardRouteSuspense><BusinessDiscoveryPage /></DashboardRouteSuspense>} />
          </Route>
          <Route path="/business" element={<SimpleRoutePage />} />
          <Route path="/resources" element={<SimpleRoutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      {!usesStandaloneHome && <Footer onNavigate={handleNavigate} />}
      <CookieConsent />
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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <PublicAppContent />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
