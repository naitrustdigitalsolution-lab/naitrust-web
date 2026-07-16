import { Shield, Eye, EyeOff, Users, FileText, Search, Mail, Phone } from "lucide-react";
import { Card } from "../../ui/card";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { motion } from "motion/react";
import { toast } from "sonner";

interface BusinessPrivacySettingsProps {
  settings: {
    showTeam?: boolean;
    showDocuments?: boolean;
    showFromSearch?: boolean;
    showEmail?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
  };
  onUpdate: (settings: {
    showTeam?: boolean;
    showDocuments?: boolean;
    showFromSearch?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean
  }) => void;
}

export function BusinessPrivacySettings({
  settings,
  onUpdate,
}: BusinessPrivacySettingsProps) {
  const handleToggle = (
    key:
      | "showTeam"
      | "showDocuments"
      | "showEmail"
      | "showFromSearch"
      | "showPhone"
      | "showAddress",
    value: boolean
  ) => {
    onUpdate({ ...settings, [key]: value });

    const messages = {
      showTeam: value
        ? "Team members visible on public profile"
        : "Team members hidden from public profile",
      showDocuments: value
        ? "Documents visible on public profile"
        : "Documents hidden from public profile",
      showFromSearch: value
        ? "Business visible in search results"
        : "Business hidden from search results",
      showEmail: value
        ? "Email visible on public profile"
        : "Email hidden from public profile",
      showPhone: value
        ? "Phone visible on public profile"
        : "Phone hidden from public profile",
      showAddress: value
        ? "Address visible on public profile"
        : "Address hidden from public profile",
    };

    toast.success(messages[key]);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Shield size={24} className="text-primary" />
        </div>
        <div>
          <h3>Privacy Settings</h3>
          <p className="text-sm text-muted-foreground">
            Control what information is displayed on your public profile
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hide Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 pb-6 border-b"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              {settings.showTeam ? (
                <EyeOff size={20} className="text-purple-600" />
              ) : (
                <Users size={20} className="text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="showTeam" className="cursor-pointer">
                Show Team Members
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Team members won't be displayed on your public business profile.
                Only visible to you in the dashboard.
              </p>
            </div>
          </div>
          <Switch
            id="showTeam"
            checked={settings.showTeam || false}
            onCheckedChange={(checked) => handleToggle("showTeam", checked)}
          />
        </motion.div>

        {/* Hide Documents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start justify-between gap-4 pb-6 border-b"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              {settings.showDocuments ? (
                <EyeOff size={20} className="text-blue-600" />
              ) : (
                <FileText size={20} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="showDocuments" className="cursor-pointer">
                Show Business Documents
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Business documents (CAC certificate, tax clearance, etc.) won't
                be shown publicly. Verification badge will still display.
              </p>
            </div>
          </div>
          <Switch
            id="showDocuments"
            checked={settings.showDocuments || false}
            onCheckedChange={(checked) =>
              handleToggle("showDocuments", checked)
            }
          />
        </motion.div>

        {/* Hide from Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start justify-between gap-4 border-b pb-6"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              {settings.showFromSearch ? (
                <EyeOff size={20} className="text-orange-600" />
              ) : (
                <Search size={20} className="text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="showFromSearch" className="cursor-pointer">
                Show Business from Search
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your business won't appear in public search results. Profile
                will only be accessible via direct link.
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-orange-600 bg-orange-500/10 rounded-lg px-3 py-2">
                <Shield size={14} />
                <span>
                  Warning: This may reduce customer visibility and trust
                </span>
              </div>
            </div>
          </div>
          <Switch
            id="showFromSearch"
            checked={settings.showFromSearch || false}
            onCheckedChange={(checked) =>
              handleToggle("showFromSearch", checked)
            }
          />
        </motion.div>


        {/* Show Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start justify-between gap-4 pb-6 border-b"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              {settings.showEmail ? (
                <Mail size={20} className="text-green-600" />
              ) : (
                <EyeOff size={20} className="text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="showEmail" className="cursor-pointer">
                Show Email Address
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your business email will be displayed on your public profile for customer inquiries.
              </p>
            </div>
          </div>
          <Switch
            id="showEmail"
            checked={settings.showEmail !== false}
            onCheckedChange={(checked) => handleToggle("showEmail", checked)}
          />
        </motion.div>

        {/* Show Phone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start justify-between gap-4 pb-6 border-b"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              {settings.showPhone ? (
                <Phone size={20} className="text-teal-600" />
              ) : (
                <EyeOff size={20} className="text-teal-600" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="showPhone" className="cursor-pointer">
                Show Phone Number
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your business phone number will be displayed on your public profile for customer contact.
              </p>
            </div>
          </div>
          <Switch
            id="showPhone"
            checked={settings.showPhone !== false}
            onCheckedChange={(checked) => handleToggle("showPhone", checked)}
          />
        </motion.div>

        {/* Show Address */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              {settings.showAddress ? (
                <FileText size={20} className="text-indigo-600" />
              ) : (
                <EyeOff size={20} className="text-indigo-600" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="showAddress" className="cursor-pointer">
                Show Business Address
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your business address will be displayed on your public profile for customer location reference.
              </p>
            </div>
          </div>
          <Switch
            id="showAddress"
            checked={settings.showAddress !== false}
            onCheckedChange={(checked) => handleToggle("showAddress", checked)}
          />
        </motion.div>
  
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Hiding information may affect customer trust
          and reduce conversion rates. We recommend keeping your profile
          transparent for maximum trust and sales.
        </p>
      </div>
    </Card>
  );
}
