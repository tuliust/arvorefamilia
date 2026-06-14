export interface FamilyTreeActions {
  zoomIn: () => void;
  zoomOut: () => void;
  print: () => Promise<void>;
  savePdf: () => Promise<void>;
  saveImage: () => Promise<void>;
  startAreaSelection: () => void;
}
