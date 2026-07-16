import { lazy, Suspense, useEffect } from "react";
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
import { AuthPageLoader } from "./components/pieces/auth/AuthPageLoader";
import { UseCasesPage } from './components/pages/UseCasesPage';
import { UseCaseDetailPage } from './components/pages/UseCaseDetailPage';
import { ReportConcernPage } from './components/pages/ReportConcernPage';
import { RequireAuth } from './components/utility/RequireAuth';

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreateDealPage = lazy(() => import("./pages/CreateDealPage"));
const DealsPage = lazy(() => import("./pages/DealsPage"));
const TransactionRoomPage = lazy(() => import("./pages/TransactionRoomPage"));
const InvitationsPage = lazy(() => import("./pages/InvitationsPage"));
const InvitationDetailPage = lazy(() => import("./pages/InvitationDetailPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SecurityCenterPage = lazy(() => import("./pages/SecurityCenterPage"));

const queryClient = new QueryClient();

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
    <div className="min-h-screen bg-background text-foreground">
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
            <Route path="/app" element={<Suspense fallback={<AuthPageLoader />}><DashboardPage /></Suspense>} />
            <Route path="/app/deals" element={<Suspense fallback={<AuthPageLoader />}><DealsPage /></Suspense>} />
            <Route path="/app/deals/new" element={<Suspense fallback={<AuthPageLoader />}><CreateDealPage /></Suspense>} />
            <Route path="/app/deals/:id" element={<Suspense fallback={<AuthPageLoader />}><TransactionRoomPage /></Suspense>} />
            <Route path="/app/invitations" element={<Suspense fallback={<AuthPageLoader />}><InvitationsPage /></Suspense>} />
            <Route path="/app/invitations/:id" element={<Suspense fallback={<AuthPageLoader />}><InvitationDetailPage /></Suspense>} />
            <Route path="/app/notifications" element={<Suspense fallback={<AuthPageLoader />}><NotificationsPage /></Suspense>} />
            <Route path="/app/profile" element={<Suspense fallback={<AuthPageLoader />}><ProfilePage /></Suspense>} />
            <Route path="/app/settings" element={<Suspense fallback={<AuthPageLoader />}><SettingsPage /></Suspense>} />
            <Route path="/app/security" element={<Suspense fallback={<AuthPageLoader />}><SecurityCenterPage /></Suspense>} />
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
