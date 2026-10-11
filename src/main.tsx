import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import AdminApp from "./admin/AdminApp.tsx";
import "./styles/index.css";

const isAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")!).render(isAdmin ? <AdminApp /> : <App />);
