import { PolicyPage } from '../pieces/general/PolicyPage';
import { pricingSections } from '../../content/policy-content';

export function PricingPage(_props: { onNavigate?: (page: string) => void; userType?: string | null; userId?: string | null }) {
  return <PolicyPage title="Fees and Pricing" description="Understand Naitrust fees, what you will see before paying and where to get help with a charge." path="/pricing" sections={pricingSections} />;
}
