import { useNavigate } from "react-router-dom";
import { VerifyEmailPage as VerifyEmailForm } from "../components/pages/VerifyEmailPage";
import { resolvePagePath } from "../libs/page-paths";

function VerifyEmailPage() {
  const navigate = useNavigate();

  return <VerifyEmailForm onNavigate={(page) => navigate(resolvePagePath(page))} />;
}

export default VerifyEmailPage;
