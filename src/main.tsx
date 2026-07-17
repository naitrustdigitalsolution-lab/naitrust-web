import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import { registerWebMcpTools } from './libs/agent/webmcp';

registerWebMcpTools();

createRoot(document.getElementById("root")!).render(<App />);
