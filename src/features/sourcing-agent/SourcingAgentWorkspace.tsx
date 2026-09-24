import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, BadgeCheck, Bot, Boxes, Check, CheckCircle2, ChevronDown,
  CircleDollarSign, ClipboardCheck, Clock3, FileText, Globe2, ImagePlus, Languages,
  Link2, LoaderCircle, MapPin, Maximize2, MessageSquareText, Mic, PackageCheck, Paperclip, Pencil,
  Search, Send, ShieldAlert, ShieldCheck, Ship, Sparkles, UserCheck, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../../components/pieces/dashboard/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { getAgentRepresentativeImage } from '../../libs/images/image-manifest';
import chargingCablesImage from '../../assets/market/products/charging-cables-v1.webp';
import wallChargersImage from '../../assets/market/products/usb-c-wall-chargers-v1.webp';
import powerBanksImage from '../../assets/market/products/power-banks-v1.webp';
import autoAccessoriesImage from '../../assets/market/products/auto-accessories-v1.webp';
import chinaAutoImage from '../../assets/market/suppliers/sup_cn_auto/1.webp';
import { defaultRunSteps, sourcingScenarios } from './mock-scenarios';
import type { EvidenceField, SourcingChatMessage, SourcingScenario, SourcingWorkspaceTab } from './types';

const tabItems: Array<{ id: SourcingWorkspaceTab; label: string; short: string; icon: typeof FileText }> = [
  { id: 'brief', label: 'Product results', short: 'Products', icon: Search },
];

const responseLanguages = ['English', 'Nigerian Pidgin', 'Hausa', 'Yoruba', 'Igbo', 'Fulfulde', 'Kanuri', 'Tiv', 'Ibibio', 'Edo', 'Nupe', 'Other Nigerian language'];
const searchCategories = ['Auto-detect', 'Electronics', 'Vehicles & automotive', 'Fashion & footwear', 'Beauty & personal care', 'Home & furniture', 'Machinery', 'Packaging', 'Building materials', 'Food & agriculture'];

type ProductMatch = { id: string; title: string; source: string; sourceUrl: string; seller: string; sellerType: string; price: string; moq: string; location: string; image: string; match: number; note: string };

const electronicsMatches: ProductMatch[] = [
  { id: 'p1', title: '100W braided USB C charging cable', source: '1688', sourceUrl: 'https://www.1688.com', seller: 'Shenzhen Lianhe Digital', sellerType: 'Wholesale seller', price: '¥5.20–¥7.80', moq: '100 pieces', location: 'Shenzhen, China', image: chargingCablesImage, match: 96, note: 'Closest match for specification and wholesale quantity.' },
  { id: 'p2', title: 'Private label 100W Type C cable', source: 'Alibaba.com', sourceUrl: 'https://www.alibaba.com', seller: 'Dongguan PowerLink', sellerType: 'Custom manufacturer', price: 'US$0.82–$1.14', moq: '1,000 pieces', location: 'Dongguan, China', image: chargingCablesImage, match: 93, note: 'Logo, length and retail packaging options shown.' },
  { id: 'p3', title: 'PD fast charge USB C cable bundle', source: 'Made-in-China', sourceUrl: 'https://www.made-in-china.com', seller: 'Guangzhou Connectech', sellerType: 'Manufacturer listing', price: 'US$0.76–$0.98', moq: '500 pieces', location: 'Guangzhou, China', image: wallChargersImage, match: 88, note: 'Lower MOQ; wattage test evidence still required.' },
  { id: 'p4', title: 'Nylon USB C cable, retail pack', source: 'Taobao', sourceUrl: 'https://www.taobao.com', seller: 'Digital Home Store', sellerType: 'Retail seller', price: '¥12.90', moq: '1 piece', location: 'Zhejiang, China', image: chargingCablesImage, match: 82, note: 'Useful for samples; retail pricing is not a wholesale quote.' },
  { id: 'p5', title: '100W USB C cable multipack', source: 'Amazon', sourceUrl: 'https://www.amazon.com', seller: 'Marketplace seller', sellerType: 'Retail marketplace', price: 'US$12.99 / 3', moq: '1 pack', location: 'International listing', image: powerBanksImage, match: 75, note: 'Reference product for reviews and packaging comparison.' },
];

const automotiveMatches: ProductMatch[] = [
  { id: 'a1', title: 'BYD Song Plus EV export specification', source: 'Dongchedi', sourceUrl: 'https://www.dongchedi.com', seller: 'Vehicle marketplace listing', sellerType: 'Chinese vehicle platform', price: '¥149,800 estimate', moq: '1 vehicle', location: 'China', image: chinaAutoImage, match: 95, note: 'Model and specification reference; exporter availability must be confirmed.' },
  { id: 'a2', title: 'BYD Song Plus new energy vehicle', source: 'Alibaba.com', sourceUrl: 'https://www.alibaba.com', seller: 'Guangzhou Auto Export Co.', sellerType: 'Vehicle exporter', price: 'US$21,500–$24,800', moq: '1 vehicle', location: 'Guangzhou, China', image: chinaAutoImage, match: 91, note: 'Export listing with configurable trim and shipping terms.' },
  { id: 'a3', title: 'Universal vehicle multimedia display', source: '1688', sourceUrl: 'https://www.1688.com', seller: 'Shenzhen RoadTech', sellerType: 'Accessories manufacturer', price: '¥420–¥680', moq: '20 pieces', location: 'Shenzhen, China', image: autoAccessoriesImage, match: 78, note: 'Accessory result; confirm vehicle model compatibility.' },
  { id: 'a4', title: 'BYD Song Plus floor mat set', source: 'Taobao', sourceUrl: 'https://www.taobao.com', seller: 'Auto Style Store', sellerType: 'Retail seller', price: '¥268', moq: '1 set', location: 'China', image: autoAccessoriesImage, match: 70, note: 'Related accessory result from a Chinese retail marketplace.' },
];

const getProductMatches = (category: string) => category === 'Vehicles & automotive' ? automotiveMatches : electronicsMatches;

const sourceTone: Record<EvidenceField['status'], string> = {
  extracted: 'bg-sky-500/10 text-sky-700 dark:text-sky-300', buyer_confirmed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  agent_confirmed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', disputed: 'bg-red-500/10 text-red-700 dark:text-red-300', unknown: 'bg-muted text-muted-foreground',
};

function EvidenceGrid({ fields, onEdit }: { fields: EvidenceField[]; onEdit: (field: EvidenceField) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">{fields.map((field) => <div key={field.id} className="rounded-2xl border bg-card p-4">
    <div className="flex items-start justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">{field.label}</p>{field.editable && <button type="button" onClick={() => onEdit(field)} aria-label={`Edit ${field.label}`} className="text-muted-foreground transition hover:text-primary"><Pencil size={13} /></button>}</div>
    <p className={`mt-2 text-sm font-semibold ${field.value.toLowerCase().includes('unknown') || field.value.toLowerCase().includes('not provided') ? 'text-muted-foreground' : ''}`}>{field.value}</p>
    <div className="mt-3 flex flex-wrap items-center gap-1.5"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${sourceTone[field.status]}`}>{field.status.replace('_', ' ')}</span><span className="text-[9px] text-muted-foreground">{field.sourceLabel}</span><span className="text-[9px] text-muted-foreground">· {field.confidence ? `${field.confidence}%` : 'no confidence'}</span></div>
    <p className="mt-2 text-[9px] text-muted-foreground">Observed {field.observedAt}</p>
  </div>)}</div>;
}

function SectionHeading({ title, description, icon: Icon }: { title: string; description: string; icon: typeof FileText }) {
  return <div className="mb-4 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={18} /></span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>;
}

function WorkspaceContent({ scenario, category, onProduct, onEdit, onAgent, onApproveDraft, onCreateOrder }: { scenario: SourcingScenario; category: string; onProduct: (product: ProductMatch) => void; onEdit: (field: EvidenceField) => void; onAgent: () => void; onApproveDraft: () => void; onCreateOrder: () => void }) {
  const products = getProductMatches(category);
  const tabStripRef = useRef<HTMLDivElement>(null);
  const tabScrollFrame = useRef<number | null>(null);

  const stopTabScroll = () => {
    if (tabScrollFrame.current !== null) window.cancelAnimationFrame(tabScrollFrame.current);
    tabScrollFrame.current = null;
  };

  const startTabScroll = (speed: number) => {
    stopTabScroll();
    const move = () => {
      if (!tabStripRef.current) return;
      tabStripRef.current.scrollLeft += speed;
      tabScrollFrame.current = window.requestAnimationFrame(move);
    };
    tabScrollFrame.current = window.requestAnimationFrame(move);
  };

  useEffect(() => stopTabScroll, []);

  return <Tabs defaultValue="brief" className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div
      ref={tabStripRef}
      className="hidden w-full overflow-x-auto border-b [scrollbar-width:thin]"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const edge = Math.min(72, bounds.width * 0.18);
        if (event.clientX < bounds.left + edge) startTabScroll(-5);
        else if (event.clientX > bounds.right - edge) startTabScroll(5);
        else stopTabScroll();
      }}
      onPointerLeave={stopTabScroll}
      onWheel={(event) => {
        if (!tabStripRef.current || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        tabStripRef.current.scrollLeft += event.deltaY;
      }}
    ><TabsList className="h-auto w-max min-w-full justify-start rounded-none bg-transparent p-2">{tabItems.map((tab) => <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 rounded-xl px-3 py-2 text-xs"><tab.icon size={14} /><span className="hidden xl:inline">{tab.label}</span><span className="xl:hidden">{tab.short}</span></TabsTrigger>)}</TabsList></div>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
      <TabsContent value="brief"><SectionHeading title={`${products.length} products matching your search`} description="Results are ranked by product similarity, not supplier verification. Open any result to review it." icon={Search} /><div className="grid gap-3 sm:grid-cols-2">{products.map((product, index) => <Card key={product.id} className="overflow-hidden rounded-2xl"><button type="button" className="block w-full text-left" onClick={() => onProduct(product)}><div className="relative h-32 overflow-hidden bg-muted"><img src={product.image} alt="" className="h-full w-full object-cover transition duration-300 hover:scale-105" /><Badge className="absolute left-3 top-3">{product.match}% match</Badge><span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-bold text-foreground shadow-sm backdrop-blur"><Globe2 size={11} /> Found on {product.source}</span></div><div className="p-4"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-muted-foreground">Source: <span className="text-foreground">{product.source}</span></span>{index === 0 && <span className="text-[10px] font-bold text-emerald-700">BEST MATCH</span>}</div><h3 className="mt-2 line-clamp-2 text-sm font-bold">{product.title}</h3><p className="mt-2 text-xs text-muted-foreground">{product.seller}</p><div className="mt-3 flex items-end justify-between"><div><strong className="text-sm text-primary">{product.price}</strong><p className="text-[10px] text-muted-foreground">MOQ {product.moq}</p></div><span className="text-xs font-semibold text-primary">View details →</span></div></div></button></Card>)}</div></TabsContent>
      <TabsContent value="listing"><SectionHeading title="What the AI understood" description="Review the search meaning and extracted specifications. Correct anything before searching again." icon={FileText} /><EvidenceGrid fields={[...scenario.brief, ...scenario.listing.slice(1, 4)]} onEdit={onEdit} /></TabsContent>
      <TabsContent value="supplier"><SectionHeading title="Sellers and manufacturers behind the results" description="See where every result came from and whether it appears to be retail, wholesale or manufacturing." icon={Boxes} /><div className="space-y-3">{products.map((product) => <Card key={product.id} className="rounded-2xl p-4"><div className="flex items-start gap-3"><img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{product.seller}</h3><Badge variant="outline">{product.sellerType}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{product.location} · Found on {product.source}</p><p className="mt-2 text-xs leading-5">{product.note}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" className="rounded-full" onClick={() => onProduct(product)}>View product</Button><Button size="sm" className="rounded-full" onClick={onAgent}>Ask agent to verify</Button></div></div></div></Card>)}</div></TabsContent>
      <TabsContent value="quotes"><SectionHeading title="Compare advertised prices" description="Compare marketplace prices and minimum quantities. Final supplier quotations may differ." icon={CircleDollarSign} /><div className="overflow-hidden rounded-2xl border"><div className="grid grid-cols-[1.4fr_.7fr_.7fr] gap-3 bg-muted/55 px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground"><span>Product and source</span><span>Price</span><span>Minimum</span></div>{products.map((product) => <button type="button" key={product.id} onClick={() => onProduct(product)} className="grid w-full grid-cols-[1.4fr_.7fr_.7fr] gap-3 border-t px-4 py-4 text-left text-xs transition hover:bg-muted/35"><span><strong className="line-clamp-1">{product.title}</strong><span className="mt-1 block text-[10px] text-muted-foreground">{product.source}</span></span><strong>{product.price}</strong><span>{product.moq}</span></button>)}</div><p className="mt-3 text-[10px] leading-4 text-muted-foreground">Prices retain their original currencies. Shipping, duty and clearing are not included unless the source explicitly states otherwise.</p></TabsContent>
      <TabsContent value="agent"><SectionHeading title="Verified agent collaboration" description="AI recommends; the buyer chooses. The agent approves every supplier facing communication." icon={UserCheck} /><div className="grid gap-3 xl:grid-cols-2">{scenario.agents.map((agent) => { const photo = getAgentRepresentativeImage(agent.id); return <Card key={agent.id} className="rounded-2xl p-4"><div className="flex items-start gap-3"><Avatar className="h-12 w-12"><AvatarImage src={photo.src} className="object-cover" /><AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{agent.businessName ?? agent.name}</h3>{agent.businessName && <p className="text-[11px] text-muted-foreground">Representative: {agent.name}</p>}</div><Badge variant={agent.status === 'overdue' ? 'destructive' : agent.status === 'assigned' ? 'success' : 'outline'}>{agent.status}</Badge></div><p className="mt-2 flex items-center gap-1 text-xs"><MapPin size={12} /> {agent.city} · ★ {agent.rating} · {agent.completedTasks} tasks</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 size={12} /> {agent.response}</p></div></div><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{agent.matchReasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul><Button variant={agent.status === 'assigned' ? 'outline' : 'default'} className="mt-4 w-full rounded-full" onClick={onAgent}>{agent.status === 'overdue' ? 'Request reassignment' : agent.status === 'assigned' ? 'Open agent assignment' : 'Choose this agent'}</Button></Card>; })}</div><Card className="mt-4 rounded-2xl p-4"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-bold"><Languages size={16} className="text-primary" /> Bilingual supplier draft</h3><Badge variant={scenario.bilingualDraft.approved ? 'success' : 'outline'}>{scenario.bilingualDraft.approved ? 'Human approved' : 'Approval required'}</Badge></div><div className="mt-4 grid gap-3 lg:grid-cols-2"><div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">English</p><p className="mt-2 text-xs leading-5">{scenario.bilingualDraft.english}</p></div><div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">简体中文</p><p className="mt-2 text-xs leading-5">{scenario.bilingualDraft.chinese}</p></div></div><Button disabled={scenario.bilingualDraft.approved} className="mt-4 rounded-full" onClick={onApproveDraft}>{scenario.bilingualDraft.approved ? <><Check size={14} /> Approved by human</> : 'Approve draft for agent review'}</Button></Card></TabsContent>
      <TabsContent value="inspection"><SectionHeading title="Product specific inspection plan" description="The agent uploads evidence; AI can organize it but cannot accept the goods for the buyer." icon={ClipboardCheck} /><div className="space-y-2">{scenario.inspection.map((item) => <div key={item.id} className="flex items-start gap-3 rounded-2xl border p-4"><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600' : item.status === 'failed' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`}>{item.status === 'passed' ? <Check size={14} /> : item.status === 'failed' ? <X size={14} /> : <Clock3 size={14} />}</span><div><p className="text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">Evidence: {item.evidence}</p><Badge variant="outline" className="mt-2 capitalize">{item.status.replace('_', ' ')}</Badge></div></div>)}</div></TabsContent>
      <TabsContent value="payment"><SectionHeading title="Protected order stages" description="AI recommendations never move money. Buyer and authorized operations approval remain mandatory." icon={ShieldCheck} /><div className="space-y-3">{scenario.payments.map((stage) => <div key={stage.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-bold">{stage.label}</p><p className="mt-1 text-xs text-muted-foreground">Beneficiary: {stage.beneficiary}</p></div><strong className="text-xl">{stage.percentage}%</strong></div><p className="mt-3 rounded-xl bg-muted/45 p-3 text-xs">Required evidence: {stage.evidence}</p><Badge variant={stage.status === 'disputed' ? 'destructive' : stage.status === 'approved' || stage.status === 'paid' ? 'success' : 'outline'} className="mt-3 capitalize">{stage.status.replace('_', ' ')}</Badge></div>)}</div><Button className="mt-5 w-full rounded-full" onClick={onCreateOrder}>Review and convert to custom order <ArrowRight size={14} /></Button></TabsContent>
      <TabsContent value="logistics"><SectionHeading title="China to Nigeria logistics" description="Estimates remain separate from confirmed partner quotes and disclose inclusions and exclusions." icon={Ship} /><div className="grid gap-3 xl:grid-cols-2">{scenario.logistics.map((quote) => <Card key={quote.id} className={`rounded-2xl p-4 ${quote.status === 'exception' ? 'border-amber-500/40' : ''}`}><div className="flex items-start justify-between"><div><h3 className="font-bold">{quote.provider}</h3><p className="mt-1 text-xs text-muted-foreground">{quote.mode} · {quote.eta}</p></div><Badge variant={quote.status === 'recommended' ? 'success' : 'outline'}>{quote.status}</Badge></div><p className="mt-4 text-xl font-bold">{quote.price}</p><div className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><div><p className="font-semibold text-emerald-700">Includes</p>{quote.includes.map((item) => <p key={item} className="mt-1 text-muted-foreground">✓ {item}</p>)}</div><div><p className="font-semibold text-amber-700">Excludes</p>{quote.excludes.map((item) => <p key={item} className="mt-1 text-muted-foreground">• {item}</p>)}</div></div></Card>)}</div></TabsContent>
    </div>
  </Tabs>;
}

export function SourcingAgentWorkspace() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(sourcingScenarios[0]);
  const [messages, setMessages] = useState<SourcingChatMessage[]>([
    { id: 'welcome', role: 'assistant', body: 'Tell me what product you need, paste a China product link, upload a photo, or add a voice note. I will find close matches and explain the results in your preferred language.', createdAt: 'Now' },
  ]);
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [runIndex, setRunIndex] = useState(-1);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [editing, setEditing] = useState<EvidenceField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [responseLanguage, setResponseLanguage] = useState('English');
  const [searchCategory, setSearchCategory] = useState('Auto-detect');
  const [selectedProduct, setSelectedProduct] = useState<ProductMatch | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const progress = running ? Math.round(((runIndex + 1) / defaultRunSteps.length) * 100) : 100;
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, runIndex]);

  const runMock = async () => {
    const body = draft.trim() || (attachments.length ? `Please assess: ${attachments.join(', ')}` : 'Please continue this sourcing request.');
    setMessages((current) => [...current, { id: `m-${Date.now()}`, role: 'buyer', body, attachments, createdAt: 'Now' }]);
    setDraft(''); setAttachments([]); setRunning(true);
    for (let index = 0; index < defaultRunSteps.length; index += 1) {
      setRunIndex(index);
      await new Promise((resolve) => window.setTimeout(resolve, 320));
    }
    const containsChinese = /[\u3400-\u9FFF]/.test(body);
    const response = containsChinese
      ? `I translated the Chinese content and prepared the product results in ${responseLanguage}. ${scenario.assistantSummary}`
      : `I found matching product options and prepared the results in ${responseLanguage}. ${scenario.assistantSummary}`;
    setMessages((current) => [...current, { id: `a-${Date.now()}`, role: 'assistant', body: response, createdAt: 'Now' }]);
    setRunning(false); setRunIndex(-1); setWorkspaceOpen(true);
  };

  const selectFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setAttachments((current) => [...current, ...Array.from(files).map((file) => file.name)]);
    toast.success(`${files.length} mock attachment${files.length === 1 ? '' : 's'} added.`);
  };

  const editField = (field: EvidenceField) => { setEditing(field); setEditValue(field.value); };
  const saveEdit = () => {
    if (!editing) return;
    const update = (fields: EvidenceField[]) => fields.map((field) => field.id === editing.id ? { ...field, value: editValue.trim() || 'Unknown', status: 'buyer_confirmed' as const, source: 'buyer' as const, sourceLabel: 'Buyer correction', confidence: 100 } : field);
    setScenario((current) => ({ ...current, brief: update(current.brief), listing: update(current.listing), supplier: update(current.supplier) }));
    setEditing(null); toast.success('Buyer correction saved to this mock session.');
  };

  const approveDraft = () => { setScenario((current) => ({ ...current, bilingualDraft: { ...current.bilingualDraft, approved: true } })); toast.success('Draft approved for agent review. Nothing was sent externally.'); };
  const productRoute = (product: ProductMatch) => {
    const productParams = new URLSearchParams({ id: product.id, title: product.title, source: product.source, sourceUrl: product.sourceUrl, supplier: product.seller, city: product.location, price: product.price, moq: product.moq, image: product.image, note: product.note });
    return `/app/source/product/${product.id}?${productParams.toString()}`;
  };
  const workspace = <WorkspaceContent scenario={scenario} category={searchCategory} onProduct={setSelectedProduct} onEdit={editField} onAgent={() => navigate('/app/agents')} onApproveDraft={approveDraft} onCreateOrder={() => toast.info('Order review opened.')} />;

  return <DashboardLayout title="Nia Product Finder"><div className="mx-auto flex w-full max-w-[96rem] flex-col gap-3">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[#071b31] px-4 py-4 text-white shadow-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-300"><Sparkles size={20} /></span><div className="min-w-0"><h1 className="truncate text-lg font-bold sm:text-xl">Nia Product Finder</h1><p className="mt-0.5 truncate text-xs text-white/55">Search with a message, product link, image or voice</p></div></div>
      <label className="relative"><span className="sr-only">Response language</span><Languages className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={14} /><select value={responseLanguage} onChange={(event) => setResponseLanguage(event.target.value)} className="h-10 max-w-[13rem] appearance-none rounded-xl border border-white/15 bg-white/10 pl-8 pr-8 text-xs font-semibold text-white outline-none">{responseLanguages.map((language) => <option className="text-foreground" key={language} value={language}>{language}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60" size={14} /></label>
    </header>

    {scenario.notice && <div className={`flex items-start gap-3 rounded-2xl border p-4 ${scenario.notice.tone === 'danger' ? 'border-red-500/25 bg-red-500/[.07]' : 'border-amber-500/25 bg-amber-500/[.08]'}`}><AlertTriangle className={scenario.notice.tone === 'danger' ? 'text-red-600' : 'text-amber-600'} size={19} /><div><p className="text-sm font-bold">{scenario.notice.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{scenario.notice.body}</p></div></div>}

    <div className="grid min-h-[calc(100svh-12.5rem)] overflow-hidden rounded-3xl border bg-card shadow-[0_16px_55px_rgba(7,27,49,.08)] lg:h-[calc(100svh-12.5rem)] lg:min-h-[34rem] lg:grid-cols-[minmax(20rem,.72fr)_minmax(0,1.28fr)]">
      <section className="flex min-h-[70svh] flex-col border-r-0 lg:min-h-0 lg:border-r">
        <div className="flex items-center justify-between border-b px-4 py-3"><div><p className="text-xs font-bold">What product are you looking for?</p><p className="text-[10px] text-muted-foreground">Use any Nigerian language. Add a China product link, photo or voice note.</p></div><div className="flex items-center gap-2"><span className="flex items-center gap-1 text-[10px] text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready</span><Button variant="outline" size="sm" className="rounded-full lg:hidden" onClick={() => setWorkspaceOpen(true)}>Products <ArrowRight size={13} /></Button></div></div>
        <ScrollArea className="min-h-0 flex-1"><div className="space-y-4 p-4">{messages.map((message) => <div key={message.id} className={`flex gap-2.5 ${message.role === 'buyer' ? 'justify-end' : ''}`}>{message.role !== 'buyer' && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bot size={15} /></span>}<div className={`max-w-[85%] rounded-2xl px-3.5 py-3 text-xs leading-5 ${message.role === 'buyer' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted/65 text-foreground'}`}><p>{message.body}</p>{message.attachments?.length ? <div className="mt-2 flex flex-wrap gap-1">{message.attachments.map((name) => <span key={name} className="rounded-lg bg-black/10 px-2 py-1 text-[9px]">{name}</span>)}</div> : null}<p className={`mt-1 text-[9px] ${message.role === 'buyer' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{message.createdAt}</p></div></div>)}
          {running && <div className="rounded-2xl border bg-card p-4"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-bold"><LoaderCircle className="animate-spin text-primary" size={15} /> Nia is searching</p><span className="text-[10px] text-muted-foreground">{progress}%</span></div><Progress value={progress} className="mt-3 h-1.5" /><div className="mt-3 space-y-2">{defaultRunSteps.map((step, index) => <div key={step} className={`flex items-center gap-2 text-[10px] ${index <= runIndex ? 'text-foreground' : 'text-muted-foreground/55'}`}>{index < runIndex ? <CheckCircle2 size={12} className="text-emerald-600" /> : index === runIndex ? <LoaderCircle size={12} className="animate-spin text-primary" /> : <span className="h-3 w-3 rounded-full border" />}{step}</div>)}</div></div>}
          <div ref={chatEndRef} /></div></ScrollArea>
        <div className="border-t bg-card p-3"><div className="mb-2 flex flex-wrap gap-1.5">{attachments.map((name) => <span key={name} className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[9px]"><Paperclip size={10} /><span className="truncate">{name}</span><button type="button" onClick={() => setAttachments((current) => current.filter((item) => item !== name))}><X size={10} /></button></span>)}</div><div className="rounded-2xl border bg-background p-2 focus-within:border-primary/40"><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (!running) void runMock(); } }} placeholder="Describe a product, paste a link, or ask in any Nigerian language…" className="min-h-20 resize-none border-0 bg-transparent p-2 text-sm shadow-none focus-visible:ring-0" /><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1"><input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,audio/*" className="hidden" onChange={(event) => selectFiles(event.target.files)} /><Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => fileRef.current?.click()} aria-label="Upload product image or file"><ImagePlus size={16} /></Button><Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => toast.info('Voice note transcription will be available here.')} aria-label="Add voice note"><Mic size={16} /></Button><label className="relative"><span className="sr-only">Product category</span><select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)} className="h-8 max-w-44 appearance-none rounded-full border bg-muted/45 pl-3 pr-7 text-[10px] font-semibold outline-none">{searchCategories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} /></label></div><Button size="sm" className="rounded-full" disabled={running || (!draft.trim() && !attachments.length)} onClick={() => void runMock()}><Send size={14} /> Search products</Button></div></div><p className="mt-2 px-1 text-[9px] leading-4 text-muted-foreground">Category helps Nia distinguish similar words and images. Leave Auto detect selected when you are unsure.</p></div>
      </section>
      <section className="hidden min-h-0 flex-col lg:flex"><div className="flex items-center justify-between border-b px-4 py-3"><div><p className="text-xs font-bold">Products found</p><p className="text-[10px] text-muted-foreground">Open a product to see its source, price and seller</p></div><Button variant="outline" size="sm" className="h-7 rounded-full text-[10px]" onClick={() => setWorkspaceOpen(true)}><Maximize2 size={12} /> View large</Button></div>{workspace}</section>
    </div>

    <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}><SheetContent side="right" className="w-full max-w-none p-0 sm:max-w-[92vw] lg:max-w-6xl"><SheetHeader className="border-b px-5 py-4 text-left"><SheetTitle>Products found</SheetTitle><SheetDescription>Open any product to see its source, price, minimum order and seller.</SheetDescription></SheetHeader><div className="flex h-[calc(100svh-5rem)] flex-col overflow-y-auto">{workspace}</div></SheetContent></Sheet>

    <Sheet open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}><SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-lg">{selectedProduct && <><div className="relative h-64 bg-muted"><img src={selectedProduct.image} alt={selectedProduct.title} className="h-full w-full object-cover" /><Badge className="absolute left-5 top-5">{selectedProduct.match}% match</Badge></div><div className="p-5"><div className="flex items-center justify-between gap-3"><Badge variant="secondary">Found on {selectedProduct.source}</Badge><span className="text-xs text-muted-foreground">{selectedProduct.location}</span></div><h2 className="mt-4 text-2xl font-bold">{selectedProduct.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedProduct.note}</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/50 p-4"><p className="text-[10px] font-bold uppercase text-muted-foreground">Advertised price</p><strong className="mt-1 block text-lg">{selectedProduct.price}</strong></div><div className="rounded-2xl bg-muted/50 p-4"><p className="text-[10px] font-bold uppercase text-muted-foreground">Minimum order</p><strong className="mt-1 block text-lg">{selectedProduct.moq}</strong></div></div><div className="mt-5 rounded-2xl border p-4"><p className="text-xs font-bold">Seller information</p><p className="mt-2 text-sm font-semibold">{selectedProduct.seller}</p><p className="mt-1 text-xs text-muted-foreground">{selectedProduct.sellerType} · {selectedProduct.location}</p></div><div className="mt-5 rounded-2xl bg-amber-500/[.08] p-4 text-xs leading-5 text-muted-foreground">This is marketplace information from the referenced source. It is not proof that the seller or manufacturer is verified. Ask a sourcing agent to check the business before payment.</div><div className="mt-5 grid gap-2 sm:grid-cols-2"><Button variant="outline" className="rounded-full" onClick={() => navigate(productRoute(selectedProduct))}><Globe2 size={14} /> Open product page</Button><Button className="rounded-full" onClick={() => { const route = productRoute(selectedProduct); navigate(route.replace(`/app/source/product/${selectedProduct.id}`, '/app/agents')); }}><UserCheck size={14} /> Verify with an agent</Button></div><Button variant="secondary" className="mt-2 w-full rounded-full" onClick={() => toast.success('Product saved to your sourcing list.')}>Save product</Button></div></>}</SheetContent></Sheet>

    <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><SheetContent side="bottom" className="rounded-t-3xl"><SheetHeader><SheetTitle>Correct {editing?.label}</SheetTitle><SheetDescription>Your correction becomes buyer confirmed evidence and remains auditable.</SheetDescription></SheetHeader><div className="px-4 pb-6"><Input value={editValue} onChange={(event) => setEditValue(event.target.value)} className="h-11" /><Button className="mt-4 w-full rounded-full" onClick={saveEdit}>Save buyer correction</Button></div></SheetContent></Sheet>
  </div></DashboardLayout>;
}
