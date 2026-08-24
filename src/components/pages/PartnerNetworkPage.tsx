import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Factory,
  Globe2,
  Languages,
  LockKeyhole,
  LogOut,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { productionNetworkApi } from "../../libs/marketplace/production-network.api";
import type { PartnerRole, PartnerSession } from "../../libs/marketplace/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { NaitrustLogo } from "../utility/NaitrustLogo";
import { SEOHead } from "../utility/SEOHead";
import { pageImages } from "../../libs/images/image-manifest";
import { useAppLocale } from "../../libs/locale-context";
import { AppLanguageToggle } from "../utility/AppLanguageToggle";
import { SourcingAgentPortal } from "./SourcingAgentPortal";

type Locale = PartnerSession["locale"];

const copy = {
  en: {
    network: "Naitrust Partner Network",
    intro:
      "Work with Nigerian buyers through a managed sourcing and supplier network.",
    agent: "Become a sourcing agent",
    supplier: "Register a Chinese supplier",
    login: "Partner sign in",
    invite: "Partner access is approved and issued by Naitrust.",
    portal: "Partner workspace",
    logout: "Sign out",
    assignments: "Current assignments",
    requests: "Buyer requests",
    payout: "Payout currency",
    seoDescription:
      "Join Naitrust as a verified sourcing agent, China supplier or logistics company and work with Nigerian buyers through managed Order Rooms.",
    homeLabel: "Go to Naitrust home",
    programme: "Verified China sourcing network",
    hero: "Join the verified professionals and companies helping Nigerian individuals and businesses buy wholesale from China with less uncertainty.",
    verificationRequired: "Naitrust verification required",
    bilingual: "English and Chinese workflows",
    imageAlt:
      "A sourcing professional in China reviewing product requirements for a Nigerian buyer",
    imageCaption:
      "China operations. Nigerian buyers. One accountable workflow.",
    roleEyebrow: "Choose your partner role",
    roleTitle: "Build trusted China-to-Nigeria orders together.",
    roleIntro:
      "Every partner applies separately and remains unverified until Naitrust completes the relevant checks.",
    agentTitle: "Sourcing agents",
    agentText:
      "Find suppliers, compare quotes, coordinate samples, inspect products and keep buyers updated.",
    agentAction: "Apply as a sourcing agent",
    supplierTitle: "China suppliers",
    supplierText:
      "Receive clear requirements, submit quotes and update samples, production and handover progress.",
    supplierAction: "Register a supplier",
    logisticsTitle: "Logistics companies",
    logisticsText:
      "Support China pickup, warehousing, freight, customs coordination and delivery to Nigeria.",
    logisticsAction: "Apply as a logistics partner",
    accessEyebrow: "How access works",
    accessTitle: "Approval before opportunity.",
    accessIntro:
      "Creating an application does not immediately activate a partner account.",
    applyTitle: "Apply",
    applyText:
      "Tell us who you are, where you operate and what services you provide.",
    verifyTitle: "Get verified",
    verifyText:
      "Naitrust reviews identity, business and operating information for your role.",
    roomsTitle: "Work in Order Rooms",
    roomsText:
      "Approved partners receive access to buyer requests, evidence and order updates.",
    approvedTitle: "Already approved by Naitrust?",
    approvedText:
      "Use the email and access code issued through your verified contact channel.",
    portalAction: "Open partner portal",
    navHome: "Home",
    navBuyers: "For Nigerian Buyers",
    navPartners: "Partners",
    navAbout: "About",
    navContact: "Contact",
  },
  "zh-CN": {
    network: "Naitrust 合作伙伴网络",
    intro: "通过受管理的采购和供应商网络与尼日利亚买家合作。",
    agent: "申请成为采购代理",
    supplier: "注册中国供应商",
    login: "合作伙伴登录",
    invite: "合作伙伴访问权限由 Naitrust 审核并签发。",
    portal: "合作伙伴工作台",
    logout: "退出登录",
    assignments: "当前任务",
    requests: "买家询价",
    payout: "结算币种",
    seoDescription:
      "作为已验证的采购代理、中国供应商或物流公司加入 Naitrust，通过受管理的订单室与尼日利亚买家合作。",
    homeLabel: "返回 Naitrust 首页",
    programme: "已验证的中国采购网络",
    hero: "加入经过验证的专业人士和企业网络，帮助尼日利亚个人和企业更安心地从中国批量采购。",
    verificationRequired: "必须通过 Naitrust 验证",
    bilingual: "中英文双语工作流程",
    imageAlt: "中国采购专业人士正在审核尼日利亚买家的产品需求",
    imageCaption: "中国本地执行，服务尼日利亚买家，全程记录清晰可查。",
    roleEyebrow: "选择合作伙伴类型",
    roleTitle: "共同建立可信赖的中尼采购订单。",
    roleIntro:
      "每类合作伙伴均须单独申请；在 Naitrust 完成相应审核前，账户将保持未验证状态。",
    agentTitle: "采购代理",
    agentText: "寻找供应商、比较报价、协调样品、验货，并及时向买家更新进展。",
    agentAction: "申请成为采购代理",
    supplierTitle: "中国供应商",
    supplierText: "接收清晰的采购需求，提交报价，并更新样品、生产及交接进度。",
    supplierAction: "注册成为供应商",
    logisticsTitle: "物流公司",
    logisticsText: "提供中国境内提货、仓储、货运、清关协调及尼日利亚配送服务。",
    logisticsAction: "申请成为物流合作伙伴",
    accessEyebrow: "访问权限流程",
    accessTitle: "先审核，后开展业务。",
    accessIntro: "提交申请不会立即开通合作伙伴账户。",
    applyTitle: "提交申请",
    applyText: "介绍您的身份、运营地点以及所提供的服务。",
    verifyTitle: "完成验证",
    verifyText: "Naitrust 将根据合作伙伴类型审核身份、企业及运营信息。",
    roomsTitle: "在订单室开展工作",
    roomsText: "获批合作伙伴可查看买家需求、证据材料和订单进度。",
    approvedTitle: "已经通过 Naitrust 审核？",
    approvedText: "请使用发送至已验证联系方式的邮箱和访问码登录。",
    portalAction: "打开合作伙伴门户",
    navHome: "首页",
    navBuyers: "尼日利亚买家",
    navPartners: "合作伙伴",
    navAbout: "关于我们",
    navContact: "联系我们",
  },
};

function isAgentRole(role: PartnerRole): boolean {
  return role === "agent";
}

export function PartnerNetworkPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(() =>
    productionNetworkApi.getPartnerSession(),
  );
  const { locale, setLocale } = useAppLocale();
  const t = copy[locale];
  const isPortal = pathname === "/partners/portal";
  const isLogin = pathname === "/partners/login";
  const applicationRole: PartnerRole | null = pathname.includes("/agent/")
    ? "agent"
    : pathname.includes("/supplier/")
      ? "supplier"
      : null;

  const changeLocale = (next: Locale) => {
    setLocale(next);
    if (session) {
      const updated = productionNetworkApi.updatePartnerLocale(next);
      setSession(updated);
    }
  };

  if (isPortal)
    return (
      <PartnerPortal
        session={session}
        locale={locale}
        onLocale={changeLocale}
        onLogout={() => {
          productionNetworkApi.logoutPartner();
          setSession(null);
          navigate("/partners/login");
        }}
      />
    );
  if (isLogin)
    return (
      <PartnerLogin
        locale={locale}
        onLocale={changeLocale}
        onLogin={(next) => {
          setSession(next);
          setLocale(next.locale);
          navigate("/partners/portal");
        }}
      />
    );
  if (applicationRole)
    return (
      <PartnerApplicationForm
        role={applicationRole}
        locale={locale}
        onLocale={changeLocale}
      />
    );

  return (
    <div className="min-h-svh bg-background">
      <SEOHead
        title={t.network}
        description={t.seoDescription}
        canonicalPath="/partners"
      />
      <main>
        <section className="overflow-hidden bg-[#04162f] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-[90rem] items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
            <div>
              <Badge className="w-fit border-white/15 bg-white/10 text-white">
                <Globe2 size={12} /> {t.programme}
              </Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-.05em] sm:text-5xl lg:text-6xl">
                {t.network}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                {t.hero}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  className="h-11 rounded-full bg-white px-6 text-[#071b31] hover:bg-white/90"
                  onClick={() => navigate("/partners/agent/apply")}
                >
                  <UserCheck size={16} /> {t.agent}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-white/20 bg-white/[.07] px-6 text-white hover:bg-white/15 hover:text-white"
                  onClick={() => navigate("/partners/login")}
                >
                  {t.login} <ArrowRight size={15} />
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/60">
                <span className="flex items-center gap-2">
                  <BadgeCheck size={15} className="text-emerald-400" />{" "}
                  {t.verificationRequired}
                </span>
                <span className="flex items-center gap-2">
                  <Languages size={15} className="text-sky-300" /> {t.bilingual}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] border border-white/10 bg-white/[.04]" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 shadow-2xl shadow-black/30">
                <img
                  src={pageImages.aboutHero.src}
                  alt={t.imageAlt}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04162f] to-transparent p-6 pt-24">
                  <p className="text-sm font-semibold">{t.imageCaption}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-[90rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
                {t.roleEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] sm:text-4xl">
                {t.roleTitle}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {t.roleIntro}
              </p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <PartnerPath
                icon={UserCheck}
                title={t.agentTitle}
                text={t.agentText}
                action={t.agentAction}
                onClick={() => navigate("/partners/agent/apply")}
                featured
              />
              <PartnerPath
                icon={Factory}
                title={t.supplierTitle}
                text={t.supplierText}
                action={t.supplierAction}
                onClick={() => navigate("/partners/supplier/apply")}
              />
              <PartnerPath
                icon={Truck}
                title={t.logisticsTitle}
                text={t.logisticsText}
                action={t.logisticsAction}
                onClick={() => navigate("/partners/logistics/apply")}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#f4f7fb] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 dark:bg-card/40">
          <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
                {t.accessEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] sm:text-4xl">
                {t.accessTitle}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {t.accessIntro}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PartnerStep
                number="01"
                title={t.applyTitle}
                text={t.applyText}
              />
              <PartnerStep
                number="02"
                title={t.verifyTitle}
                text={t.verifyText}
              />
              <PartnerStep
                number="03"
                title={t.roomsTitle}
                text={t.roomsText}
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#071a32] p-7 text-white sm:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                {t.approvedTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {t.approvedText}
              </p>
            </div>
            <Button
              className="h-11 shrink-0 rounded-full px-6"
              onClick={() => navigate("/partners/login")}
            >
              {t.portalAction} <ArrowRight size={16} />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function PartnerPath({
  icon: Icon,
  title,
  text,
  action,
  onClick,
  featured = false,
}: {
  icon: typeof UserCheck;
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <Card
      className={`group rounded-[1.5rem] p-6 transition hover:-translate-y-1 hover:shadow-xl ${featured ? "border-primary/30 bg-primary/[.035]" : ""}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={21} />
      </span>
      <h3 className="mt-7 text-xl font-bold">{title}</h3>
      <p className="mt-3 min-h-18 text-sm leading-6 text-muted-foreground">
        {text}
      </p>
      <Button
        variant={featured ? "default" : "outline"}
        className="mt-6 w-full rounded-full"
        onClick={onClick}
      >
        {action} <ArrowRight size={15} />
      </Button>
    </Card>
  );
}

function PartnerStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <span className="text-xs font-bold text-primary">{number}</span>
      <h3 className="mt-7 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function PartnerTopbar({
  locale,
  onLocale,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
}) {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <NaitrustLogo size="md" />
      <AppLanguageToggle compact />
    </header>
  );
}

function LanguageToggle({
  locale,
  onLocale,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
}) {
  return <AppLanguageToggle compact />;
}

function PartnerBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UserCheck;
  title: string;
  text: string;
}) {
  return (
    <Card className="rounded-3xl p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={19} />
      </span>
      <h2 className="mt-4 font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </Card>
  );
}

function PartnerApplicationForm({
  role,
  locale,
  onLocale,
}: {
  role: PartnerRole;
  locale: Locale;
  onLocale: (locale: Locale) => void;
}) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState(
    role === "supplier" ? "" : undefined,
  );
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+86 ");
  const [city, setCity] = useState("Guangzhou");
  const [services, setServices] = useState(
    role === "agent"
      ? "Market sourcing, factory visits, inspection"
      : "Products, custom manufacturing, export fulfilment",
  );
  const [experience, setExperience] = useState("");

  const submit = () => {
    if (
      !contactName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !experience.trim() ||
      (role === "supplier" && !companyName?.trim())
    ) {
      toast.error(
        locale === "zh-CN"
          ? "请填写所有必填项。"
          : "Complete all required fields.",
      );
      return;
    }
    productionNetworkApi.submitApplication({
      role,
      companyName: companyName?.trim() || undefined,
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      languages: locale === "zh-CN" ? ["Mandarin"] : ["Mandarin", "English"],
      services: services
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      experience: experience.trim(),
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-svh bg-[#f2f6f9] px-4 py-6 dark:bg-background sm:px-6">
      <PartnerTopbar locale={locale} onLocale={onLocale} />
      <main className="mx-auto mt-6 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-3 rounded-full"
          onClick={() => navigate("/partners")}
        >
          Back
        </Button>
        {submitted ? (
          <Card className="rounded-3xl p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
            <h1 className="mt-4 text-2xl font-bold">
              {locale === "zh-CN" ? "申请已提交" : "Application submitted"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {locale === "zh-CN"
                ? "Naitrust 将审核您的资料。批准后，访问代码将通过已验证的联系方式发送。"
                : "Naitrust will review your information. If approved, a partner access code will be issued through your verified contact channel."}
            </p>
            <Button
              className="mt-6 rounded-full"
              onClick={() => navigate("/partners/login")}
            >
              Partner sign in
            </Button>
          </Card>
        ) : (
          <Card className="rounded-3xl p-5 sm:p-8">
            <Badge>
              {role === "agent" ? "Sourcing agent" : "Chinese supplier"}
            </Badge>
            <h1 className="mt-4 text-3xl font-bold">
              {role === "agent"
                ? locale === "zh-CN"
                  ? "采购代理申请"
                  : "Sourcing agent application"
                : locale === "zh-CN"
                  ? "中国供应商注册"
                  : "Chinese supplier registration"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Applications are reviewed by Naitrust. Registration does not
              create immediate platform access.
            </p>
            <div className="mt-6 space-y-4">
              {role === "supplier" && (
                <div>
                  <Label htmlFor="partner-company">Company legal name</Label>
                  <Input
                    id="partner-company"
                    className="mt-2"
                    value={companyName ?? ""}
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="partner-contact">Contact name</Label>
                  <Input
                    id="partner-contact"
                    className="mt-2"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="partner-city">City</Label>
                  <Input
                    id="partner-city"
                    className="mt-2"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="partner-email">Business email</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    className="mt-2"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="partner-phone">Chinese phone number</Label>
                  <Input
                    id="partner-phone"
                    className="mt-2"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="partner-services">
                  {role === "agent"
                    ? "Services offered"
                    : "Products and capabilities"}
                </Label>
                <Input
                  id="partner-services"
                  className="mt-2"
                  value={services}
                  onChange={(event) => setServices(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="partner-experience">
                  Experience and operating background
                </Label>
                <Textarea
                  id="partner-experience"
                  className="mt-2 min-h-28 resize-y"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder={
                    role === "agent"
                      ? "Tell Naitrust about sourcing, quality control, markets, and cities you cover."
                      : "Describe your factory, products, customization, production capacity, and export experience."
                  }
                />
              </div>
              <Button className="h-11 w-full rounded-full" onClick={submit}>
                Submit for review
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function PartnerLogin({
  locale,
  onLocale,
  onLogin,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onLogin: (session: PartnerSession) => void;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const login = () => {
    try {
      onLogin(productionNetworkApi.loginPartner(email, code));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Partner sign in failed.",
      );
    }
  };
  return (
    <div className="min-h-svh bg-[#f2f6f9] px-4 py-6 dark:bg-background sm:px-6">
      <PartnerTopbar locale={locale} onLocale={onLocale} />
      <main className="mx-auto mt-12 max-w-md">
        <Card className="rounded-3xl p-6 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole size={21} />
          </span>
          <h1 className="mt-5 text-2xl font-bold">{copy[locale].login}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy[locale].invite}
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="partner-login-email">Email</Label>
              <Input
                id="partner-login-email"
                className="mt-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="partner-login-code">Partner access code</Label>
              <Input
                id="partner-login-code"
                className="mt-2"
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <Button className="h-11 w-full rounded-full" onClick={login}>
              Sign in
            </Button>
            <div className="rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
              <p className="font-semibold text-foreground">Demo access only</p>
              <button
                type="button"
                className="mt-1 text-left text-primary"
                onClick={() => {
                  setEmail("amina.yusuf@naitrust.test");
                  setCode("AGENT-AMINA-2026");
                }}
              >
                Use Amina Yusuf sourcing-agent demo
              </button>
              <br />
              <button
                type="button"
                className="text-left text-primary"
                onClick={() => {
                  setEmail("brightpack.partner@naitrust.test");
                  setCode("SUPPLIER-BRIGHT-2026");
                }}
              >
                Use approved supplier demo
              </button>
            </div>
            <Button
              variant="ghost"
              className="w-full rounded-full"
              onClick={() => navigate("/partners")}
            >
              Back to partner network
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function PartnerPortal({
  session,
  locale,
  onLocale,
  onLogout,
}: {
  session: PartnerSession | null;
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  if (!session)
    return (
      <div className="grid min-h-svh place-items-center bg-muted/30 p-4">
        <Card className="max-w-md rounded-3xl p-8 text-center">
          <LockKeyhole className="mx-auto text-primary" />
          <h1 className="mt-4 text-xl font-bold">Partner access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the email and access code issued by Naitrust.
          </p>
          <Button
            className="mt-5 rounded-full"
            onClick={() => navigate("/partners/login")}
          >
            Partner sign in
          </Button>
        </Card>
      </div>
    );
  if (isAgentRole(session.role))
    return (
      <SourcingAgentPortal
        session={session}
        locale={locale}
        onLocale={onLocale}
        onLogout={onLogout}
      />
    );
  const partnerRole = session.role as PartnerRole;
  const assignments = productionNetworkApi.partnerAssignments(partnerRole);
  const t = copy[locale];
  return (
    <div className="min-h-svh bg-[#eef3f7] dark:bg-background">
      <header className="border-b bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <NaitrustLogo size="sm" />
            <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
              Partner Network
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle locale={locale} onLocale={onLocale} />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={onLogout}
            >
              <LogOut size={14} /> {t.logout}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <section className="rounded-3xl bg-[#061a31] p-5 text-white sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="border-white/15 bg-white/10 text-white">
                <BadgeCheck size={12} /> Approved {session.role}
              </Badge>
              <h1 className="mt-4 text-3xl font-bold">{session.name}</h1>
              <p className="mt-2 text-sm text-white/60">
                {t.portal} ·{" "}
                {session.role === "supplier" ? "中国供应商" : "采购代理"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="rounded-xl bg-white/10 px-4 py-3">
                <strong className="block text-xl">{assignments.length}</strong>
                {session.role === "agent" ? t.assignments : t.requests}
              </span>
              <span className="rounded-xl bg-white/10 px-4 py-3">
                <strong className="block text-xl">CNY / USD</strong>
                {t.payout}
              </span>
            </div>
          </div>
        </section>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.34fr]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {session.role === "agent" ? t.assignments : t.requests}
              </h2>
              <Badge variant="outline">Naitrust managed</Badge>
            </div>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{assignment.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {assignment.buyer}
                      </p>
                    </div>
                    <Badge>{assignment.status}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {session.role === "agent" ? (
                        <>
                          <MapPin size={13} />{" "}
                          {"city" in assignment ? assignment.city : "China"}
                        </>
                      ) : (
                        <>
                          <ClipboardList size={13} />{" "}
                          {"quantity" in assignment ? assignment.quantity : ""}
                        </>
                      )}
                    </span>
                    <span className="font-semibold">
                      {"fee" in assignment ? assignment.fee : "Open enquiry"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-full"
                    onClick={() =>
                      toast.success(
                        session.role === "agent"
                          ? "Assignment opened."
                          : "Buyer request opened.",
                      )
                    }
                  >
                    {session.role === "agent"
                      ? "Open assignment"
                      : "Review request"}{" "}
                    <ArrowRight size={14} />
                  </Button>
                </Card>
              ))}
            </div>
          </section>
          <aside className="space-y-4">
            <Card className="rounded-2xl p-5">
              <PackageCheck size={19} className="text-primary" />
              <h2 className="mt-4 font-bold">
                {session.role === "agent"
                  ? "Evidence and updates"
                  : "Supplier experience"}
              </h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {session.role === "agent"
                  ? "Upload sourcing findings, inspection photos, factory notes, and shipping handover evidence for Naitrust review."
                  : "Receive translated specifications, ask questions, submit quotes, confirm samples, and update each production stage."}
              </p>
            </Card>
            <Card className="rounded-2xl p-5">
              <Truck size={19} className="text-primary" />
              <h2 className="mt-4 font-bold">Payment and shipping</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Naitrust admin approves assignments and settlement. Available
                payout currencies depend on the partner and regulated payment
                corridor.
              </p>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
