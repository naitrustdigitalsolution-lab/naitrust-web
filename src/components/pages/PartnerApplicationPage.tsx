import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
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
import { AppLanguageToggle } from "../utility/AppLanguageToggle";
import { useAppLocale } from "../../libs/locale-context";

const configs = {
  agent: {
    kind: "sourcing_agent",
    title: "China-based sourcing agent application",
    zh: "采购代理申请",
    zhDescription: "面向在中国运营的专业人士和采购公司，不限国籍。请告诉我们您的运营地点、采购品类以及您如何提供可信证据。",
    description:
      "For professionals and sourcing companies operating in China, regardless of nationality. Tell us where you operate, what you source, and how you provide trustworthy evidence.",
    icon: UserCheck,
  },
  supplier: {
    kind: "supplier",
    title: "Supplier registration",
    zh: "供应商注册",
    zhDescription: "提交贵公司的产品能力、定制和履约信息以供审核。",
    description:
      "Register your company, product capability, customization and fulfilment information for review.",
    icon: Store,
  },
  logistics: {
    kind: "logistics_provider",
    title: "Logistics partner application",
    zh: "物流合作伙伴申请",
    zhDescription: "提交路线、提货、仓储、货运、清关和配送能力，以便分别进行验证。",
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
  const { locale } = useAppLocale();
  const isZh = locale === "zh-CN";
  const text = isZh ? {
    network: "合作伙伴网络", required: "请填写必填的联系人、地点和服务信息。", submittedToast: "申请已提交，等待 Naitrust 审核。",
    received: "申请已收到", receivedText: "Naitrust 将审核此申请。提交注册不会立即获得平台访问权限。", back: "返回合作伙伴网络",
    controlled: "受控合作伙伴入驻", company: "公司法定名称", contact: "联系人姓名 *", email: "企业邮箱 *", phone: "电话号码 *", city: "运营城市 *", languages: "语言",
    services: "服务 *", servicesPlaceholder: "请用逗号分隔各项服务", routes: "路线或覆盖范围", routesPlaceholder: "广州至拉各斯", licences: "许可证", capacity: "服务能力", insurance: "保险与理赔",
    experience: "经验与运营背景", experiencePlaceholder: "请说明您的经验、运营地点、产品类别、设施以及如何提供证据。", review: "申请须经人工审核。采购、验货、集货和物流等能力将分别进行验证。", submit: "提交审核",
  } : {
    network: "Partner network", required: "Complete the required contact, location and service fields.", submittedToast: "Application submitted for Naitrust review.",
    received: "Application received", receivedText: "Naitrust will review the application. Registration does not create immediate platform access.", back: "Back to partner network",
    controlled: "Controlled partner onboarding", company: "Company legal name", contact: "Contact name *", email: "Business email *", phone: "Phone number *", city: "Operating city *", languages: "Languages",
    services: "Services *", servicesPlaceholder: "Separate services with commas", routes: "Routes or coverage", routesPlaceholder: "Guangzhou to Lagos", licences: "Licences", capacity: "Capacity", insurance: "Insurance and claims",
    experience: "Experience and operating background", experiencePlaceholder: "Describe your experience, locations, categories, facilities and how you provide evidence.", review: "Approval requires human review. Capabilities such as sourcing, inspection, consolidation and logistics are verified separately.", submit: "Submit for review",
  };
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
        text.required,
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
    toast.success(text.submittedToast);
  };

  return (
    <div className="min-h-svh bg-muted/40 p-3 sm:p-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <NaitrustLogo size="sm" />
        <AppLanguageToggle />
      </header>
      <main className="mx-auto mt-5 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-3 -ml-2 rounded-full"
          onClick={() => navigate("/partners")}
        >
          <ArrowLeft size={15} /> {text.network}
        </Button>
        {submitted ? (
          <Card className="grid min-h-96 place-items-center rounded-3xl p-8 text-center">
            <div>
              <CheckCircle2 className="mx-auto text-emerald-600" size={38} />
              <h1 className="mt-4 text-2xl font-bold">
                {text.received}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {text.receivedText}
              </p>
              <Button
                className="mt-6 rounded-full"
                onClick={() => navigate("/partners")}
              >
                {text.back}
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
                  {text.controlled}
                </Badge>
                <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                  {isZh ? config.zh : config.title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isZh ? config.zhDescription : config.description}
                </p>
              </div>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field
                label={text.company}
                value={form.companyName}
                onChange={(value) => set("companyName", value)}
              />
              <Field
                label={text.contact}
                value={form.contactName}
                onChange={(value) => set("contactName", value)}
              />
              <Field
                label={text.email}
                type="email"
                value={form.email}
                onChange={(value) => set("email", value)}
              />
              <Field
                label={text.phone}
                value={form.phone}
                onChange={(value) => set("phone", value)}
              />
              <Field
                label={text.city}
                value={form.city}
                onChange={(value) => set("city", value)}
              />
              <Field
                label={text.languages}
                value={form.languages}
                onChange={(value) => set("languages", value)}
              />
              <Field
                label={text.services}
                value={form.services}
                onChange={(value) => set("services", value)}
                placeholder={text.servicesPlaceholder}
              />
              <Field
                label={text.routes}
                value={form.routes}
                onChange={(value) => set("routes", value)}
                placeholder={text.routesPlaceholder}
              />
              {config.kind === "logistics_provider" && (
                <>
                  <Field
                    label={text.licences}
                    value={form.licences}
                    onChange={(value) => set("licences", value)}
                  />
                  <Field
                    label={text.capacity}
                    value={form.capacitySummary}
                    onChange={(value) => set("capacitySummary", value)}
                  />
                  <Field
                    label={text.insurance}
                    value={form.insuranceSummary}
                    onChange={(value) => set("insuranceSummary", value)}
                  />
                </>
              )}
              <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                {text.experience}
                <Textarea
                  className="min-h-28"
                  value={form.experience}
                  onChange={(event) => set("experience", event.target.value)}
                  placeholder={text.experiencePlaceholder}
                />
              </label>
            </div>
            <p className="mt-5 rounded-2xl bg-muted/55 p-4 text-xs leading-5 text-muted-foreground">
              {text.review}
            </p>
            <Button className="mt-5 h-11 w-full rounded-full" onClick={submit}>
              {text.submit}
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
