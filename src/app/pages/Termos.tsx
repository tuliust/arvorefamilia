import { LegalDocumentPage } from './legal/LegalDocumentPage';
import { termsContent } from './legal/legalContent';

export function Termos() {
  return <LegalDocumentPage content={termsContent} />;
}
