import { PublicLegalDocumentPage } from './legal/PublicLegalDocumentPage';
import { privacyPolicyContent } from './legal/legalContent';

export function Privacidade() {
  return <PublicLegalDocumentPage content={privacyPolicyContent} />;
}
