import { useState } from 'react';
import { BadgeCheck, Boxes, Gift, Globe2, PackageSearch, Receipt, RotateCcw, Store, Truck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Switch } from '../../../../components/ui/switch';
import { chinaWholesalePreset, setPlatformFeatures, updatePlatformFeature, usePlatformFeatures, type PlatformFeatures } from '../../../../libs/platform-features';

const controls: Array<{ key: keyof Omit<PlatformFeatures, 'chinaWholesaleFocus'>; title: string; description: string; icon: typeof Store; core?: boolean }> = [
  { key: 'marketplace', title: 'China wholesale catalogue', description: 'Let customers browse wholesale products and verified suppliers. Turn this off for an agent-led request-only launch.', icon: Store, core: true },
  { key: 'sourcingAgents', title: 'Sourcing-agent directory', description: 'Show verified sourcing and inspection agents, profiles, favourites and agent-supported orders.', icon: UserCheck, core: true },
  { key: 'logistics', title: 'China–Nigeria logistics', description: 'Keep shipping, consolidation, customs and delivery operations available.', icon: Truck, core: true },
  { key: 'sellerShowcase', title: 'Nigerian seller showcases', description: 'Business storefront and local seller publishing tools outside the focused China buying journey.', icon: Boxes },
  { key: 'bills', title: 'Business bills', description: 'Utility and recurring bill-payment tools.', icon: Receipt },
  { key: 'rewards', title: 'General rewards', description: 'Customer-wide rewards pages. Agent customer-referral rewards remain available in the Partner Network.', icon: Gift },
];

export function FeatureControlSection() {
  const live = usePlatformFeatures();
  const [features, setFeatures] = useState(live);
  const toggle = (key: keyof PlatformFeatures, value: boolean) => {
    const updated = updatePlatformFeature(key, value);
    setFeatures(updated);
    toast.success(`${key.replace(/([A-Z])/g, ' $1')} ${value ? 'enabled' : 'disabled'}.`);
  };
  const applyFocus = () => {
    setPlatformFeatures(chinaWholesalePreset);
    setFeatures(chinaWholesalePreset);
    toast.success('China wholesale focus mode applied.');
  };
  return <div className="space-y-5">
    <Card className="overflow-hidden rounded-3xl border-primary/15">
      <div className="bg-[#071a32] p-5 text-white sm:p-7"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><BadgeCheck className="text-sky-300" size={22} /><h2 className="mt-4 text-2xl font-bold">China wholesale focus mode</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Focus Naitrust on Nigerians finding wholesale products in China, working with verified sourcing agents, coordinating suppliers in Order Rooms and managing delivery to Nigeria.</p></div><Button className="w-fit rounded-full bg-white text-[#071a32] hover:bg-white/90" onClick={applyFocus}><RotateCcw size={15} /> Apply focus preset</Button></div></div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6"><FocusItem icon={PackageSearch} text="China wholesale sourcing" /><FocusItem icon={UserCheck} text="Verified sourcing agents" /><FocusItem icon={Globe2} text="Bilingual Order Rooms" /><FocusItem icon={Truck} text="China–Nigeria delivery" /></div>
    </Card>
    <div><h2 className="text-lg font-bold">Customer-facing features</h2><p className="mt-1 text-xs text-muted-foreground">Changes apply immediately in this environment. Disabled features disappear from navigation and direct links return customers to the focused dashboard.</p></div>
    <div className="grid gap-3 lg:grid-cols-2">{controls.map((control) => <Card key={control.key} className="rounded-2xl p-5"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><control.icon size={18} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold">{control.title}</h3>{control.core && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Focus feature</span>}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{control.description}</p></div><Switch checked={features[control.key]} onCheckedChange={(checked) => toggle(control.key, checked)} aria-label={`Toggle ${control.title}`} /></div></Card>)}</div>
  </div>;
}

function FocusItem({ icon: Icon, text }: { icon: typeof UserCheck; text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3 text-sm font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background text-primary"><Icon size={15} /></span>{text}</div>;
}
