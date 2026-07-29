import { useNavigate } from "react-router-dom";
import { VerifyEmailPage as VerifyEmailForm } from "../components/pages/VerifyEmailPage";
import { resolvePagePath } from "../libs/page-paths";

function VerifyEmailPage() {
  const navigate = useNavigate();

  return <VerifyEmailForm onNavigate={(page) => {
    const returnTo = sessionStorage.getItem("naitrust.returnTo");
    if ((page === "customer-dashboard" || page === "business-dashboard") && returnTo) {
      sessionStorage.removeItem("naitrust.returnTo");
      navigate(returnTo, { replace: true });
      return;
    }
    navigate(resolvePagePath(page));
  }} />;
}

export default VerifyEmailPage;
