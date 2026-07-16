/**
 * PWA Settings Section Component
 * Wrapper component for PWA settings in Business Settings page
 */

import { Smartphone } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { PWASettings } from '../../utility/PWASettings';

export function PWASettingsSection() {
  return (
    <Card>
      <CardContent className="p-6">
        <PWASettings />
      </CardContent>
    </Card>
  );
}

