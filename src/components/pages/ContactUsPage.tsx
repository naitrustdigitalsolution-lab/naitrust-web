import { useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "../utility/SEOHead";
import { PublicFormLayout } from "../pieces/general/PublicFormLayout";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { contactUs } from "../../services/publicService";
import { useTranslation } from 'react-i18next';

interface Props {
  onNavigate: (page: string) => void;
}
export function ContactUsPage({ onNavigate }: Props) {
  const { t } = useTranslation('contact');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await contactUs(form);
      setSent(true);
      toast.success(t('sentToast'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('error'),
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <SEOHead
        title={t('seoTitle')}
        description={t('seoDescription')}
        canonicalPath="/contact"
      />
      <PublicFormLayout
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        highlights={[
          t('highlight1'), t('highlight2'), t('highlight3'),
        ]}
      >
        {sent ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="mt-5 text-2xl font-bold">{t('received')}</h2>
            <p className="mt-3 text-muted-foreground">
              {t('thankYou')}
            </p>
            <Button className="mt-7" onClick={() => setSent(false)}>
              {t('another')}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail />
            </div>
            <h2 className="text-2xl font-bold">{t('sendTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t('sendText')}
            </p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact-name">{t('fullName')}</Label>
                  <Input
                    id="contact-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">{t('email')}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-subject">{t('subject')}</Label>
                <Input
                  id="contact-subject"
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="contact-message">{t('message')}</Label>
                <Textarea
                  id="contact-message"
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="mt-2 min-h-36"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  t('sending')
                ) : (
                  <>
                    {t('send')} <Send />
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => onNavigate("home")}
                className="w-full text-sm font-semibold text-primary"
              >
                {t('backHome')}
              </button>
            </form>
          </>
        )}
      </PublicFormLayout>
    </>
  );
}
