import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginPage as LoginForm } from "../components/pages/LoginPage";
import { resolvePagePath } from "../libs/page-paths";

function VerifyCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <LoginForm
      initialEmail={searchParams.get("email") || ""}
      initialView="verify-otp"
      onNavigate={(page) => navigate(resolvePagePath(page))}
    />
  );
}

export default VerifyCodePage;
