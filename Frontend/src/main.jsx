import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RouterPage from "./RouterPage";
import { ToastProvider } from "@heroui/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider placement="top-center" toastOffset={60} />
    <RouterPage />
  </StrictMode>
);
