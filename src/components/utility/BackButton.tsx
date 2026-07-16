import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="mb-4 -ml-2"
    >
      <ArrowLeft size={18} className="mr-2" />
      {label}
    </Button>
  );
}
