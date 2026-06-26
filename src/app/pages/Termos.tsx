import { PublicLegalDocumentPage } from './legal/PublicLegalDocumentPage';
import { termsContent } from './legal/legalContent';

export function Termos() {
  return <PublicLegalDocumentPage content={termsContent} />;
}
