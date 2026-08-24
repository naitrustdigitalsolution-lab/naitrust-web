import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Link2, Loader2, Mail, Plus, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { marketplaceApi } from '../../libs/marketplace/marketplace.api';
import { useAuth } from '../../libs/auth-context';
import { useInviteBuyerToOrder } from '../../hooks/useOrderInvitations';

interface LinkRow { url: string; note: string; quantity: string }

const emptyRow = (): LinkRow => ({ url: '', note: '', quantity: '' });

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inviteBuyer = useInviteBuyerToOrder();
  const [startingFor, setStartingFor] = useState<'myself' | 'a-buyer'>('myself');
  const [buyerContact, setBuyerContact] = useState('');
  const [rows, setRows] = useState<LinkRow[]>([emptyRow()]);
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [buyerContactError, setBuyerContactError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentInviteUrl, setSentInviteUrl] = useState('');

  const updateRow = (index: number, key: keyof LinkRow, value: string) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
    setErrors((current) => ({ ...current, [index]: '' }));
  };

  const addRow = () => setRows((current) => [...current, emptyRow()]);
  const removeRow = (index: number) => setRows((current) => current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : current);

  const submit = async () => {
    const filled = rows.filter((row) => row.url.trim());
    const nextErrors: Record<number, string> = {};
    rows.forEach((row, index) => {
      if (row.url.trim() && !/^https?:\/\/\S+$/i.test(row.url.trim())) nextErrors[index] = 'Enter a valid product link starting with http:// or https://.';
    });
    if (!filled.length) nextErrors[0] = 'Add at least one product link.';
    const missingBuyerContact = startingFor === 'a-buyer' && !buyerContact.trim();
    setErrors(nextErrors);
    setBuyerContactError(missingBuyerContact ? "Enter the buyer's email or phone number." : '');
    if (Object.keys(nextErrors).length || missingBuyerContact) return;

    const links = filled.map((row) => ({ url: row.url.trim(), note: row.note.trim() || undefined, quantity: row.quantity.trim() ? Number(row.quantity) : undefined }));
    setSubmitting(true);
    try {
      if (startingFor === 'a-buyer') {
        const { url } = await inviteBuyer.mutateAsync({
          orderSummary: `${links.length} product link${links.length === 1 ? '' : 's'} to review`,
          destination: destination.trim() || 'Nigeria',
          links,
          contact: buyerContact.trim(),
          invitedByName: user?.name ?? 'A Naitrust sourcing agent',
        });
        await navigator.clipboard.writeText(url).catch(() => undefined);
        setSentInviteUrl(url);
        toast.success('Invitation link created and copied. Share it with the buyer.');
        return;
      }
      const order = await marketplaceApi.createCustomOrder({
        links,
        destination: destination.trim() || 'Nigeria',
        notes: notes.trim() || undefined,
      });
      toast.success('Order started. Choose a sourcing agent to continue.');
      navigate(`/app/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start this order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Start an order">
      <div className="mx-auto w-full max-w-3xl">
        <PageHero
          eyebrow="Custom order"
          title="Start an order from product links"
          description="Paste product links from any Chinese platform — 1688, Taobao, Alibaba, or any other site. A verified sourcing agent confirms supplier, price, and specifications before anything is paid."
          icon={Link2}
          actions={
            <Button variant="outline" className="rounded-full bg-background/80" onClick={() => navigate('/app/orders')}>
              <ArrowLeft size={15} /> Orders
            </Button>
          }
        />

        <div className="mt-5 inline-flex rounded-full border bg-muted/40 p-1 text-sm">
          <button type="button" onClick={() => setStartingFor('myself')} className={`rounded-full px-4 py-2 font-semibold transition ${startingFor === 'myself' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>I'm the buyer</button>
          <button type="button" onClick={() => setStartingFor('a-buyer')} className={`rounded-full px-4 py-2 font-semibold transition ${startingFor === 'a-buyer' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>I'm sourcing for a buyer</button>
        </div>

        <Card className="mt-3 rounded-2xl p-5 sm:p-6">
          {sentInviteUrl ? (
            <div className="py-4 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><Mail size={20} /></span>
              <h2 className="mt-4 font-bold">Invitation sent</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">The buyer will register or sign in, review these products, and the order is created in their own account once they accept.</p>
              <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-xl border bg-muted/30 p-2">
                <p className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{sentInviteUrl}</p>
                <Button size="sm" variant="ghost" className="shrink-0 rounded-lg" onClick={() => void navigator.clipboard.writeText(sentInviteUrl).then(() => toast.success('Copied'))}><Copy size={14} /> Copy</Button>
              </div>
              <Button variant="outline" className="mt-5 rounded-full" onClick={() => navigate('/app/orders')}>Back to orders</Button>
            </div>
          ) : (
          <>
          {startingFor === 'a-buyer' && (
            <div className="mb-5">
              <Label htmlFor="buyer-contact">Buyer's email or phone</Label>
              <Input id="buyer-contact" value={buyerContact} onChange={(event) => { setBuyerContact(event.target.value); setBuyerContactError(''); }} placeholder="buyer@example.com" className="mt-1.5" />
              {buyerContactError && <p className="mt-1 text-xs text-destructive">{buyerContactError}</p>}
              <p className="mt-1.5 text-xs text-muted-foreground">Not yet on Naitrust? They'll register through the invite link and land straight on this order.</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Product links</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Add every product you want this order to cover.</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {rows.map((row, index) => (
              <div key={index} className="rounded-xl border p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <Label htmlFor={`link-url-${index}`}>Product link</Label>
                      <Input id={`link-url-${index}`} value={row.url} onChange={(event) => updateRow(index, 'url', event.target.value)} placeholder="https://..." className="mt-1.5" />
                      {errors[index] && <p className="mt-1 text-xs text-destructive">{errors[index]}</p>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                      <div>
                        <Label htmlFor={`link-note-${index}`}>Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
                        <Input id={`link-note-${index}`} value={row.note} onChange={(event) => updateRow(index, 'note', event.target.value)} placeholder="Color, size, spec..." className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor={`link-qty-${index}`}>Quantity</Label>
                        <Input id={`link-qty-${index}`} type="number" min="1" value={row.quantity} onChange={(event) => updateRow(index, 'quantity', event.target.value)} placeholder="1" className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                  {rows.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="mt-6 h-9 w-9 shrink-0 rounded-full text-muted-foreground" aria-label="Remove link" onClick={() => removeRow(index)}>
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={addRow}>
            <Plus size={15} /> Add another link
          </Button>

          <div className="mt-6 grid gap-4 border-t pt-5">
            <div>
              <Label htmlFor="order-destination">Delivery destination</Label>
              <Input id="order-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Lagos, Nigeria" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="order-notes">Notes for the sourcing agent <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea id="order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything the agent should know before checking these products" className="mt-1.5 min-h-24" />
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-xs leading-5 text-muted-foreground">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
            <p>
              {startingFor === 'a-buyer'
                ? "No payment moves at this step. The buyer reviews these products and pays only once they approve a confirmed quote."
                : 'No payment moves at this step. After the order is created, invite a verified sourcing agent to confirm supplier, price, and specifications before anything is paid.'}
            </p>
          </div>

          <Button className="mt-6 w-full rounded-full" disabled={submitting} onClick={() => void submit()}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            {submitting ? 'Sending…' : startingFor === 'a-buyer' ? 'Invite the buyer' : 'Start order'}
          </Button>
          </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
