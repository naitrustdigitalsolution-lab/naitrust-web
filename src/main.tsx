import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import { registerWebMcpTools } from './libs/agent/webmcp';
import { AuthProvider } from './libs/auth-context';
import { registerServiceWorker } from './libs/pwa/register-service-worker';

registerWebMcpTools();
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
