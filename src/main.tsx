import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { MobileTreeControlsPortal } from "./app/components/FamilyTree/MobileTreeControlsPortal.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <MobileTreeControlsPortal />
  </>
);
