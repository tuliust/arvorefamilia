import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { MobileTreeControlsPortal } from "./app/components/FamilyTree/MobileTreeControlsPortal.tsx";
import "./styles/index.css";
import "./styles/mobile-tree-controls.css";
import "./styles/mobile-edit-profile.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <MobileTreeControlsPortal />
  </>
);
