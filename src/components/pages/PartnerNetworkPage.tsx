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
  Lock,
  LockKeyhole,
  LogOut,
  Mail,
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
import { getAppImage, pageImages } from "../../libs/images/image-manifest";
import { useAppLocale } from "../../libs/locale-context";
import { AppLanguageToggle } from "../utility/AppLanguageToggle";
import { SourcingAgentPortal } from "./SourcingAgentPortal";
import spiralBackground from "../../assets/spiral.svg";

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
  const details = locale === "zh-CN" ? {
    overviewEyebrow: "合作要求",
    overviewTitle: "申请前，请先了解各角色的责任。",
    overviewIntro: "Naitrust 只批准能够提供可验证身份、真实运营能力和清晰证据记录的合作伙伴。申请和审核不收取保证金，也不保证获得订单。",
    requirements: [
      { title: "采购代理", items: ["在中国合法居住或运营", "能够用中文与供应商沟通", "提供报价、验货和现场证据", "披露费用、利益冲突和可服务区域"] },
      { title: "中国供应商", items: ["可核验的企业注册和经营地址", "清晰的产品、起订量、产能和交期", "接受样品、生产和交接进度记录", "报价与收款主体信息一致"] },
      { title: "物流合作伙伴", items: ["可核验的公司、许可和保险信息", "明确中国提货、仓储、货运或尼日利亚配送能力", "提供可追踪的交接和运输文件", "透明列明费用、时效和责任边界"] },
    ],
    workflowEyebrow: "合作流程",
    workflowTitle: "从买家需求到尼日利亚交付，全程保留记录。",
    workflow: [
      ["01", "接收明确需求", "仅查看分配给您的询价、规格、数量、时间和证据要求。"],
      ["02", "提交透明报价", "分开列明产品、服务、验货、包装、物流和其他费用。"],
      ["03", "记录执行证据", "上传带时间的照片、视频、文件、检查结果和进度更新。"],
      ["04", "等待买家确认", "规格、报价、变更和付款节点必须由授权方确认。"],
      ["05", "完成交接与复核", "记录货物交接、运输文件、问题处理和最终结果。"],
    ],
    standardsEyebrow: "验证与标准",
    standardsTitle: "验证是持续责任，不是永久认证。",
    standards: ["身份和授权代表", "企业注册和受益所有权", "经营地址与设施", "服务能力和历史证据", "银行或结算收款人一致性", "投诉、表现和定期复核"],
    boundaryTitle: "合作伙伴不能控制买家的采购资金。",
    boundaryText: "采购代理、供应商和物流公司只能执行其获批范围内的工作。合作伙伴不能自行更换供应商、修改已接受报价、批准自己的费用、转移买家资金或代表 Naitrust 作出保证。受监管的支付合作伙伴处理资金流转；Naitrust 管理订单工作流、记录和授权。",
    paymentTitle: "费用与结算",
    paymentText: "每项费用必须在买家确认前显示。供应商货款、代理服务费、验货费和物流费分别记录。可用币种、汇率、扣费、退款和结算时间取决于获批的支付通道、合规审查和订单状态。",
    faqEyebrow: "常见问题",
    faqTitle: "申请前需要了解的信息",
    faqs: [
      ["提交申请后会立即获得订单吗？", "不会。申请须经人工审核，批准也不保证订单数量或收入。任务取决于买家需求、地点、能力、表现和可用性。"],
      ["个人可以申请成为采购代理吗？", "可以，但必须提供身份、在华运营依据、经验、服务范围和可核验的工作证据。"],
      ["Naitrust 是否雇佣采购代理？", "除非书面合同另有说明，合作伙伴是独立服务提供者，不是 Naitrust 员工，也无权代表 Naitrust 作出承诺。"],
      ["验证标签代表什么？", "它表示页面列出的检查已完成，并不保证产品质量、交付结果或未来行为。"],
      ["如何加入？", "在当前早期体验阶段，请加入候补名单并选择您的合作伙伴角色。Naitrust 会联系符合当前运营需求的申请人。"],
    ],
    joinTitle: "准备建立可信赖的中尼订单？",
    joinText: "加入合作伙伴候补名单，告诉我们您的角色、运营地点、能力和服务范围。",
    joinAction: "加入合作伙伴候补名单",
  } : {
    overviewEyebrow: "Partner requirements",
    overviewTitle: "Know what each role is accountable for before applying.",
    overviewIntro: "Naitrust approves only partners who can demonstrate verifiable identity, genuine operating capability and clear evidence practices. Applying or being reviewed requires no security deposit and does not guarantee work.",
    requirements: [
      { title: "Sourcing agents", items: ["Legally based or operating in China", "Able to communicate with Chinese suppliers", "Can provide quote, inspection and on-site evidence", "Discloses fees, conflicts and service coverage"] },
      { title: "China suppliers", items: ["Verifiable business registration and operating address", "Clear products, MOQ, capacity and lead times", "Supports sample, production and handover records", "Quoted seller matches the approved settlement recipient"] },
      { title: "Logistics partners", items: ["Verifiable company, licence and insurance information", "Defined pickup, warehousing, freight or Nigeria-delivery capability", "Traceable custody and shipping documentation", "Transparent charges, timelines and responsibility boundaries"] },
    ],
    workflowEyebrow: "Operating workflow",
    workflowTitle: "Documented from the buyer brief to delivery in Nigeria.",
    workflow: [
      ["01", "Receive a defined brief", "See only assigned enquiries, specifications, quantities, deadlines and evidence requirements."],
      ["02", "Submit a transparent quote", "Separate product, service, inspection, packaging, logistics and other charges."],
      ["03", "Record execution evidence", "Upload dated photos, videos, documents, findings and progress updates."],
      ["04", "Wait for buyer approval", "Specifications, quotes, changes and payment stages require authorised approval."],
      ["05", "Complete handover and review", "Record custody transfer, shipping documents, issues and the final outcome."],
    ],
    standardsEyebrow: "Verification and standards",
    standardsTitle: "Verification is an ongoing responsibility, not a permanent endorsement.",
    standards: ["Identity and authorised representative", "Business registration and beneficial ownership", "Operating address and facilities", "Capability and prior-work evidence", "Bank or settlement-recipient matching", "Complaints, performance and periodic review"],
    boundaryTitle: "Partners never control a buyer's supplier funds.",
    boundaryText: "Agents, suppliers and logistics companies work only within an approved scope. A partner cannot replace a supplier, change an accepted quote, approve its own fee, redirect buyer money or make guarantees for Naitrust. Regulated payment partners handle money movement; Naitrust manages the order workflow, records and approvals.",
    paymentTitle: "Fees and settlement",
    paymentText: "Every charge must be visible before buyer approval. Supplier funds, agent service fees, inspection fees and logistics charges are recorded separately. Available currencies, FX, deductions, refunds and settlement timing depend on the approved payment corridor, compliance review and order status.",
    faqEyebrow: "Partner FAQ",
    faqTitle: "What to know before applying",
    faqs: [
      ["Does approval guarantee assignments or sales?", "No. Applications are manually reviewed, and approval does not guarantee order volume or income. Opportunities depend on buyer demand, location, capability, performance and availability."],
      ["Can an individual apply as a sourcing agent?", "Yes, but the applicant must provide identity, a lawful basis for operating in China, experience, service coverage and verifiable work evidence."],
      ["Are sourcing agents Naitrust employees?", "Unless a written agreement says otherwise, partners are independent service providers. They are not Naitrust employees and cannot make commitments on Naitrust's behalf."],
      ["What does a verification badge mean?", "It means the checks listed on the profile were completed. It is not a guarantee of product quality, delivery outcome or future conduct."],
      ["How do I join during early access?", "Join the waiting list and select your partner role. Naitrust will contact applicants whose location and capabilities fit current operating needs."],
    ],
    joinTitle: "Ready to help build accountable China-to-Nigeria orders?",
    joinText: "Join the partner waiting list and tell us your role, operating location, capabilities and service coverage.",
    joinAction: "Join the partner waiting list",
  };

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
      <header className="border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-3 sm:h-20">
          <button type="button" onClick={() => navigate('/')} aria-label={t.homeLabel}><NaitrustLogo size="sm" showText /></button>
          <div className="flex items-center gap-2"><AppLanguageToggle compact /><Button variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex" onClick={() => navigate('/partners/login')}><LockKeyhole size={14} /> {t.login}</Button></div>
        </div>
      </header>
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

        <section className="border-y bg-[#f7f9fc] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 dark:bg-card/30">
          <div className="mx-auto max-w-[90rem]"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{details.overviewEyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{details.overviewTitle}</h2><p className="mt-4 leading-7 text-muted-foreground">{details.overviewIntro}</p></div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">{details.requirements.map((role, index) => <Card key={role.title} className="rounded-3xl p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{index === 0 ? <UserCheck size={20}/> : index === 1 ? <Factory size={20}/> : <Truck size={20}/>}</span><h3 className="mt-5 text-xl font-bold">{role.title}</h3><ul className="mt-5 space-y-3">{role.items.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-6 text-muted-foreground"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-600"/>{item}</li>)}</ul></Card>)}</div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-[90rem]"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{details.workflowEyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{details.workflowTitle}</h2></div><div className="mt-10 grid overflow-hidden rounded-3xl border md:grid-cols-5">{details.workflow.map(([number,title,text]) => <article key={number} className="border-b p-5 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><span className="text-3xl font-black text-primary/20">{number}</span><h3 className="mt-5 font-bold">{title}</h3><p className="mt-3 text-xs leading-5 text-muted-foreground">{text}</p></article>)}</div></div></section>

        <section className="bg-[#071a32] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[1fr_.9fr]"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-300">{details.standardsEyebrow}</p><h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-.04em] sm:text-4xl">{details.standardsTitle}</h2><div className="mt-8 grid gap-3 sm:grid-cols-2">{details.standards.map((item) => <p key={item} className="flex gap-2 rounded-2xl border border-white/10 bg-white/[.05] p-4 text-sm text-white/75"><ShieldCheck size={17} className="shrink-0 text-emerald-300"/>{item}</p>)}</div></div><div className="space-y-4"><Card className="rounded-3xl border-white/10 bg-white/[.07] p-6 text-white"><Lock size={22} className="text-sky-300"/><h3 className="mt-5 text-xl font-bold">{details.boundaryTitle}</h3><p className="mt-3 text-sm leading-7 text-white/65">{details.boundaryText}</p></Card><Card className="rounded-3xl border-white/10 bg-white/[.07] p-6 text-white"><Building2 size={22} className="text-sky-300"/><h3 className="mt-5 text-xl font-bold">{details.paymentTitle}</h3><p className="mt-3 text-sm leading-7 text-white/65">{details.paymentText}</p></Card></div></div></section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[.65fr_1.35fr]"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{details.faqEyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{details.faqTitle}</h2></div><div className="divide-y rounded-3xl border px-5 sm:px-7">{details.faqs.map(([question,answer], index) => <details key={question} open={index === 0} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden">{question}<span className="text-xl text-primary transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{answer}</p></details>)}</div></div></section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8"><div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-6 rounded-[2rem] bg-primary p-7 text-white sm:p-10 lg:flex-row lg:items-center"><div><h2 className="text-2xl font-bold sm:text-3xl">{details.joinTitle}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{details.joinText}</p></div><Button className="h-11 shrink-0 rounded-full bg-white px-6 text-primary hover:bg-white/90" onClick={() => navigate('/waitlist')}>{details.joinAction}<ArrowRight size={16}/></Button></div></section>

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
  const partnerHighlights = locale === "zh-CN"
    ? ["查看进行中的采购任务、订单室和交付进度", "集中保存供应商核查、文件、消息和证据", "查看结算货币和已批准的付款记录"]
    : ["Return to assignments, Order Rooms and delivery progress in one place", "Keep supplier checks, documents, messages and evidence together", "Review payout currencies and approved payment records"];
  const partnerLoginImage = getAppImage("agents", "A verified sourcing agent reviewing product requirements for a Nigerian buyer");

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-foreground dark:bg-background">
      <SEOHead title={copy[locale].login} description={copy[locale].seoDescription} canonicalPath="/partners/login" />
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-[#eef3f8] dark:bg-[#0A0E1A] lg:block" />
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8">
        <img
          src={spiralBackground}
          alt=""
          aria-hidden="true"
          className="absolute left-4 top-1/2 bottom-0 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 rotate-180 opacity-100 sm:left-6 lg:left-8"
        />
      </div>
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="auth-balanced-panel hidden flex-col justify-between rounded-2xl p-5 sm:p-8 lg:flex lg:rounded-none lg:p-10">
          <div>
            <button type="button" onClick={() => navigate("/")} className="mb-6 inline-flex items-center lg:mb-12" aria-label={copy[locale].homeLabel}>
              <NaitrustLogo size="postMd" textColor="text-primary" />
            </button>
            <div className="max-w-md">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">Partner workspace</p>
              <h1 className="text-2xl font-bold leading-tight text-[#0b2b45] dark:text-white sm:text-3xl lg:text-4xl">Welcome back. Continue with confidence.</h1>
              <p className="mt-2 text-sm leading-6 text-[#496274] dark:text-slate-300 sm:mt-4 sm:text-base sm:leading-7">{copy[locale].invite}</p>
              <div className="mt-10 grid gap-2.5 lg:gap-3">
                {partnerHighlights.map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl border border-white/70 bg-white/70 p-4 text-sm leading-6 text-muted-foreground shadow-sm dark:border-white/10 dark:bg-card dark:text-slate-300">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <img src={partnerLoginImage.src} alt={partnerLoginImage.alt} loading="lazy" className="mt-5 aspect-3/2 w-full rounded-2xl object-cover shadow-sm" />
            </div>
          </div>
          <div className="mt-10 text-sm leading-6 text-muted-foreground">
            Not a partner yet?{' '}
            <button type="button" onClick={() => navigate("/partners")} className="font-semibold text-primary hover:underline">
              See how to apply
            </button>
          </div>
        </aside>

        <main className="auth-balanced-form flex min-h-full items-center justify-center py-4 lg:py-10">
          <div className="w-full max-w-md">
            <Card className="mx-auto w-full max-w-md border-none bg-card/95 p-0 sm:rounded-2xl sm:border sm:border-border/70 sm:p-8 sm:shadow-2xl">
              <div className="mb-8 text-center">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LockKeyhole size={22} />
                </span>
                <p className="mb-2 text-sm font-semibold text-primary">{copy[locale].login}</p>
                <h1 className="mb-2 text-2xl font-bold text-[#0b2b45] dark:text-white">{copy[locale].portal}</h1>
                <p className="text-sm leading-6 text-muted-foreground">{copy[locale].invite}</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="partner-login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="partner-login-email" className="h-11 pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-login-code">Partner access code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground" size={18} />
                    <Input id="partner-login-code" className="h-11 pl-10" type="password" value={code} onChange={(event) => setCode(event.target.value)} />
                  </div>
                </div>
                <Button className="h-12 w-full rounded-lg" size="lg" onClick={login}>
                  Sign in <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-primary/25 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                <p className="font-semibold text-foreground">Sandbox demo credentials</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setEmail("amina.yusuf@naitrust.test");
                      setCode("AGENT-AMINA-2026");
                    }}
                  >
                    Sourcing agent
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setEmail("brightpack.partner@naitrust.test");
                      setCode("SUPPLIER-BRIGHT-2026");
                    }}
                  >
                    Approved supplier
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button type="button" onClick={() => navigate("/partners")} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  <ArrowLeft size={13} className="mr-1 inline" /> Back to partner network
                </button>
              </div>
            </Card>
          </div>
        </main>
      </div>
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
