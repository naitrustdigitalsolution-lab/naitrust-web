import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Languages,
  Ship,
  Store,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { NaitrustLogo } from "../utility/NaitrustLogo";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { sourcingApi } from "../../features/sourcing/api/sourcing.api";
import type { PartnerKind } from "../../features/sourcing/domain/types";

const configs = {
  agent: {
    kind: "sourcing_agent",
    title: "Nigerian China-based agent application",
    zh: "采购代理申请",
    description:
      "For Nigerian professionals and sourcing companies based in China. Tell us where you operate, what you source, and how you provide trustworthy evidence.",
    icon: UserCheck,
  },
  supplier: {
    kind: "supplier",
    title: "Supplier registration",
    zh: "供应商注册",
    description:
      "Register your company, product capability, customization and fulfilment information for review.",
    icon: Store,
  },
  logistics: {
    kind: "logistics_provider",
    title: "Logistics partner application",
    zh: "物流合作伙伴申请",
    description:
      "Submit routes, pickup, warehouse, freight, customs and delivery capabilities for separate verification.",
    icon: Ship,
  },
} as const;

export function PartnerApplicationPage() {
  const navigate = useNavigate();
  const { kind } = useParams<{ kind?: string }>();
  const selectedKind = kind && kind in configs ? kind as keyof typeof configs : null;
  const config = configs[selectedKind ?? "agent"];
  const Icon = config.icon;
  const [locale, setLocale] = useState<"en" | "zh-CN">("en");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    languages: "Mandarin, English",
    services: "",
    routes: "",
    licences: "",
    insuranceSummary: "",
    capacitySummary: "",
    experience: "",
  });
  if (!selectedKind) return <Navigate to="/partners" replace />;
  const set = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const submit = () => {
    if (
      !form.contactName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.services.trim()
    ) {
      toast.error(
        "Complete the required contact, location and service fields.",
      );
      return;
    }
    sourcingApi.submitPartnerApplication({
      kind: config.kind as PartnerKind,
      companyName: form.companyName.trim() || undefined,
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      country: "CN",
      city: form.city.trim(),
      languages: form.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      services: form.services
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      routes: form.routes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      licences: form.licences
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      insuranceSummary: form.insuranceSummary.trim() || undefined,
      capacitySummary: form.capacitySummary.trim() || undefined,
      experience: form.experience.trim(),
    });
    setSubmitted(true);
    toast.success("Application submitted for Naitrust review.");
  };

  return (
    <div className="min-h-svh bg-muted/40 p-3 sm:p-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <NaitrustLogo size="sm" />
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() =>
            setLocale((value) => (value === "en" ? "zh-CN" : "en"))
          }
        >
          <Languages size={14} /> {locale === "en" ? "中文" : "English"}
        </Button>
      </header>
      <main className="mx-auto mt-5 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-3 -ml-2 rounded-full"
          onClick={() => navigate("/partners")}
        >
          <ArrowLeft size={15} /> Partner network
        </Button>
        {submitted ? (
          <Card className="grid min-h-96 place-items-center rounded-3xl p-8 text-center">
            <div>
              <CheckCircle2 className="mx-auto text-emerald-600" size={38} />
              <h1 className="mt-4 text-2xl font-bold">
                {locale === "en" ? "Application received" : "申请已收到"}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Naitrust will review the application. Registration does not
                create immediate platform access.
              </p>
              <Button
                className="mt-6 rounded-full"
                onClick={() => navigate("/partners")}
              >
                Back to partner network
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="rounded-3xl p-5 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon size={19} />
              </span>
              <div>
                <Badge>
                  {locale === "en"
                    ? "Controlled partner onboarding"
                    : "受控合作伙伴入驻"}
                </Badge>
                <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                  {locale === "en" ? config.title : config.zh}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field
                label="Company legal name"
                value={form.companyName}
                onChange={(value) => set("companyName", value)}
              />
              <Field
                label="Contact name *"
                value={form.contactName}
                onChange={(value) => set("contactName", value)}
              />
              <Field
                label="Business email *"
                type="email"
                value={form.email}
                onChange={(value) => set("email", value)}
              />
              <Field
                label="Phone number *"
                value={form.phone}
                onChange={(value) => set("phone", value)}
              />
              <Field
                label="Operating city *"
                value={form.city}
                onChange={(value) => set("city", value)}
              />
              <Field
                label="Languages"
                value={form.languages}
                onChange={(value) => set("languages", value)}
              />
              <Field
                label="Services *"
                value={form.services}
                onChange={(value) => set("services", value)}
                placeholder="Separate services with commas"
              />
              <Field
                label="Routes or coverage"
                value={form.routes}
                onChange={(value) => set("routes", value)}
                placeholder="Guangzhou to Lagos"
              />
              {config.kind === "logistics_provider" && (
                <>
                  <Field
                    label="Licences"
                    value={form.licences}
                    onChange={(value) => set("licences", value)}
                  />
                  <Field
                    label="Capacity"
                    value={form.capacitySummary}
                    onChange={(value) => set("capacitySummary", value)}
                  />
                  <Field
                    label="Insurance and claims"
                    value={form.insuranceSummary}
                    onChange={(value) => set("insuranceSummary", value)}
                  />
                </>
              )}
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                Experience and operating background
                <Textarea
                  className="min-h-28"
                  value={form.experience}
                  onChange={(event) => set("experience", event.target.value)}
                  placeholder="Describe your experience, locations, categories, facilities and how you provide evidence."
                />
              </label>
            </div>
            <p className="mt-5 rounded-2xl bg-muted/55 p-4 text-xs leading-5 text-muted-foreground">
              Approval requires human review. Capabilities such as sourcing,
              inspection, consolidation and logistics are verified separately.
            </p>
            <Button className="mt-5 h-11 w-full rounded-full" onClick={submit}>
              Submit for review
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
