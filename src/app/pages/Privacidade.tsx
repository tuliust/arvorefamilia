import { LegalDocumentPage } from './legal/LegalDocumentPage';
import { privacyPolicyContent } from './legal/legalContent';

export function Privacidade() {
  return <LegalDocumentPage content={privacyPolicyContent} />;
}
