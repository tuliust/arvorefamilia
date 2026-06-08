import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { MobileTreeControlsPortal } from "./app/components/FamilyTree/MobileTreeControlsPortal.tsx";
import { MobileUserMenuPalettePortal } from "./app/components/layout/MobileUserMenuPalettePortal.tsx";
import "./styles/index.css";
import "./styles/mobile-tree-controls.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <MobileTreeControlsPortal />
    <MobileUserMenuPalettePortal />
  </>
);
