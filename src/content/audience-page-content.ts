import { Building2, CheckCircle2, Fingerprint, PackageCheck, ReceiptText, Search, Shield, Store, Users } from 'lucide-react';
import { pageImages } from '../libs/images/image-manifest';

export type Audience = 'business' | 'customer';

export const audienceContent = {
  en: {
    business: {
      eyebrow: 'Naitrust for business', title: 'Control business payments from agreement to settlement.', titleHighlight: 'from agreement to settlement.', description: 'A planned protected-payment account for companies, merchants and growing teams that need verified beneficiaries, clear approvals and auditable releases.', heroImage: pageImages.businessHero.src, heroAlt: 'A business team reviewing a protected payment', primary: 'Join business early access', register: 'register-business', sectionLabel: 'Built for business payments', whoTitle: 'Give every important payment a clear purpose and approval trail.', whoCopy: 'Use Protected Deals for vendor deposits, procurement, services, projects and service agreements while keeping funds, evidence and decisions connected.',
      useCases: [
        { icon: Store, title: 'Vendor payments', text: 'Verify the beneficiary and protect supplier deposits until the agreed conditions are met.' },
        { icon: PackageCheck, title: 'Procurement and delivery', text: 'Connect purchase terms, invoices and delivery evidence to each release decision.' },
        { icon: Building2, title: 'Projects and contractors', text: 'Break commercial work into accountable deliverables with documented approval.' },
        { icon: Users, title: 'Team controls', text: 'Give authorized team members visibility into terms, evidence, payment status and decisions.' },
      ],
      steps: [
        { icon: Fingerprint, title: 'Verify your business', text: 'Complete identity and business checks and define who may authorize payments.' },
        { icon: Store, title: 'Create a Protected Deal', text: 'Invite the other party and agree the amount, scope, deadline and release conditions.' },
        { icon: ReceiptText, title: 'Protect the funds', text: 'Fund through supported regulated payment rails and confirm the beneficiary.' },
        { icon: PackageCheck, title: 'Approve settlement', text: 'Review the required evidence before release, refund or dispute resolution.' },
      ],
    },
    customer: {
      eyebrow: 'Naitrust for individuals', title: 'Protect important payments before money changes hands.', titleHighlight: 'before money changes hands.', description: 'Use clear terms, verified identities and controlled release for purchases, services, deposits and other high-trust transactions.', heroImage: pageImages.customerHero.src, heroAlt: 'An individual making a protected digital payment', primary: 'Join individual early access', register: 'register-customer', sectionLabel: 'More ways to use Naitrust', whoTitle: 'Pay with more confidence when trust alone is not enough.', whoCopy: 'A Protected Deal keeps the agreement, evidence, funding status and release decision together for both sides.',
      useCases: [
        { icon: Search, title: 'Online purchases', text: 'Agree exactly what is being bought and when payment may be released.' },
        { icon: Store, title: 'Services and freelance work', text: 'Protect deposits or service payments while work is completed.' },
        { icon: ReceiptText, title: 'Vehicle and property deposits', text: 'Record the purpose, recipient, documents and refund conditions before funding.' },
        { icon: PackageCheck, title: 'Delivery-based payments', text: 'Confirm receipt, review evidence and report a problem before release.' },
      ],
      steps: [
        { icon: Search, title: 'Create the terms', text: 'Describe the item or service, amount, deadline and release conditions.' },
        { icon: ReceiptText, title: 'Invite the other party', text: 'Both sides review the same agreement and verified participant details.' },
        { icon: Shield, title: 'Protect the payment', text: 'Fund the deal through supported regulated rails instead of paying directly.' },
        { icon: CheckCircle2, title: 'Approve the outcome', text: 'Release when satisfied or report an issue through the documented process.' },
      ],
    },
  },
  'zh-CN': {
    business: {
      eyebrow: 'Naitrust 企业采购', title: '为您的尼日利亚企业从中国采购批发产品。', titleHighlight: '从中国采购批发产品。', description: '为尼日利亚零售商、贸易商、批发商和企业提供采购账户，与已验证采购代理合作并管理中国订单。', heroImage: pageImages.businessHero.src, heroAlt: pageImages.businessHero.alt, primary: '开通企业账户', register: 'register-business', sectionLabel: '适用对象', whoTitle: '让企业以更清晰的方式从中国采购。', whoCopy: '选择已验证采购代理，说明需求，批准报价，并跟踪每个批发订单从供应商核查到尼日利亚交付。',
      useCases: [
        { icon: Store, title: '已验证采购代理', text: '按服务、地点和已完成订单反馈比较在中国运营的专业人员。' },
        { icon: PackageCheck, title: '产品与报价', text: '提供规格和数量，然后查看完整采购及到岸成本报价。' },
        { icon: Building2, title: '供应商协调', text: '将供应商核查、样品、生产证据和审批与订单关联。' },
        { icon: Users, title: '团队可见性', text: '为企业提供清晰的沟通、文件、付款和配送记录。' },
      ],
      steps: [
        { icon: Fingerprint, title: '验证企业', text: '完成身份和企业核查，让代理和供应商了解合作方。' },
        { icon: Store, title: '选择采购代理', text: '寻找在中国运营且服务符合产品和订单需求的已验证代理。' },
        { icon: ReceiptText, title: '批准报价', text: '付款前审核数量、规格、代理服务和完整到岸成本。' },
        { icon: PackageCheck, title: '跟踪订单', text: '在一个订单室中跟踪供应商核查、生产、运输、清关和配送。' },
      ],
    },
    customer: {
      eyebrow: 'Naitrust 买家服务', title: '寻找已验证的中国供应商，并在尼日利亚收货。', titleHighlight: '在尼日利亚收货。', description: '选择在中国运营的已验证采购代理，了解完整到岸成本，并跟踪订单送达尼日利亚。', heroImage: pageImages.customerHero.src, heroAlt: pageImages.customerHero.alt, primary: '开通买家账户', register: 'register-customer', sectionLabel: '使用 Naitrust 的更多方式', whoTitle: '进口采购不再依赖陌生供应商或零散代理。', whoCopy: '采购代理帮助寻找并核查合适的中国供应商，Naitrust 则集中保存报价、审批、证据、付款和物流。',
      useCases: [
        { icon: Search, title: '寻找采购代理', text: '按产品专长、服务和地点比较在中国运营的已验证代理。' },
        { icon: Store, title: '说明您的需求', text: '向代理提供产品、数量、质量、预算和配送要求。' },
        { icon: ReceiptText, title: '获取到岸成本报价', text: '付款前查看产品、验货、清关、操作、保险和物流费用。' },
        { icon: PackageCheck, title: '跟踪配送', text: '在一个订单室中跟踪备货、验货、出口、运输、清关和配送。' },
      ],
      steps: [
        { icon: Search, title: '建立供应商订单', text: '选择供应商产品、数量、规格和配送目的地。' },
        { icon: ReceiptText, title: '批准确认报价', text: '查看供应商原始成本和完整奈拉付款总额。' },
        { icon: Shield, title: '支付订单', text: '支付已确认的奈拉报价，物流费用保持清晰列明。' },
        { icon: CheckCircle2, title: '确认交付', text: '在约定阶段确认收到的产品，然后放行供应商资金。' },
      ],
    },
  },
} as const;

export const audienceUi = {
  en: { how: 'See how it works', identity: 'Verified identity', quotes: 'Clear terms', tracking: 'Payment tracking', sourcing: 'Protected payments', tagline: 'Agree. Protect. Approve.', howLabel: 'How it works', howTitle: 'A clear path from agreement to protected settlement.', imageCaption: 'The right payment flow depends on the agreement, evidence and release conditions.', supportLabel: 'Protected Deal workflow', routeTitle: 'One clear route from commitment to settlement.', chooseTitle: 'Verify who you are paying', chooseText: 'Review the individual, business and beneficiary details connected to the transaction.', recordTitle: 'Protect payment with a clear record', recordText: 'Keep terms, invoices, messages, approvals, evidence and settlement status in a shared Deal Room.', ready: 'Ready to protect an important payment?', readyText: 'Join a platform built around clear agreements, verified participants and visible human approvals.' },
  'zh-CN': { how: '查看运作方式', identity: '身份已验证', quotes: '报价已确认', tracking: '订单跟踪', sourcing: 'Naitrust 采购', tagline: '选择代理，采购并跟踪。', howLabel: '运作方式', howTitle: '从产品想法到有证据支持的订单，路径清晰。', imageCaption: '正确的订单流程取决于供应商和配送地点。', supportLabel: '代理协助采购', routeTitle: '从中国到尼日利亚，一条清晰路径。', chooseTitle: '选择已验证采购代理', chooseText: '比较在中国运营的代理，为订单选择合适的产品专长、服务和地点。', recordTitle: '从中国采购并保留清晰记录', recordText: '在共享订单室中保存供应商选项、核查、报价、审批、付款、证据和配送进度。', ready: '准备好无需出行即可采购？', readyText: '加入一个围绕易懂证据、已验证人工协助和清晰买家审批打造的平台。' },
} as const;
