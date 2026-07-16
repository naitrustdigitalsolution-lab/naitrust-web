import { useNavigate } from "react-router-dom";
import { OnboardingPage } from "../components/pages/OnboardingPage";
import { resolvePagePath } from "../libs/page-paths";

function SignupPage({ initialType = "choice" }: { initialType?: "choice" | "business" | "customer" }) {
  const navigate = useNavigate();

  return <OnboardingPage initialType={initialType} onNavigate={(page) => navigate(resolvePagePath(page))} />;
}

export default SignupPage;
