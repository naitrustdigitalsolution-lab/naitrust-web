import { useNavigate } from "react-router-dom";
import { LoginPage as LoginForm } from "../components/pages/LoginPage";
import { resolvePagePath } from "../libs/page-paths";

function LoginPage() {
  const navigate = useNavigate();

  return <LoginForm onNavigate={(page) => navigate(resolvePagePath(page))} />;
}

export default LoginPage;
