import { useLocation, useNavigate } from "react-router-dom";
import { LoginPage as LoginForm } from "../components/pages/LoginPage";
import { resolvePagePath } from "../libs/page-paths";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get('returnTo');

  return <LoginForm onNavigate={(page) => {
    const path = resolvePagePath(page);
    navigate(page === 'register' && returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path);
  }} />;
}

export default LoginPage;
