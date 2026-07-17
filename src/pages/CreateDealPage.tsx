import { CreateDealPage as CreateDealScreen } from '../components/pages/CreateDealPage';
import { useLocation } from 'react-router-dom';

function CreateDealPage() {
  const location = useLocation();
  // Moving between "new" and a selected draft must reset all wizard state.
  return <CreateDealScreen key={location.search || 'new'} />;
}

export default CreateDealPage;
