import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OnboardingPage } from "../components/pages/OnboardingPage";
import { resolvePagePath } from "../libs/page-paths";

function SignupPage({ initialType = "choice" }: { initialType?: "choice" | "business" | "customer" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
      sessionStorage.setItem("naitrust.returnTo", returnTo);
    }
  }, [returnTo]);

  return <OnboardingPage initialType={initialType} onNavigate={(page) => navigate(resolvePagePath(page))} />;
}

export default SignupPage;
