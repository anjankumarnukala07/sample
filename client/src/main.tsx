import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import TextContextProvider from "./lib/TextContextProvider"
createRoot(document.getElementById("root")!).render(
  <>
    <TextContextProvider>
      <App />
      <Toaster />
    </TextContextProvider>
  </>
);
