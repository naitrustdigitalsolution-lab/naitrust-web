import { Building2, CheckCircle2, Fingerprint, PackageCheck, ReceiptText, Search, Shield, Store, Users } from 'lucide-react';
import { pageImages } from '../libs/images/image-manifest';

export type Audience = 'business' | 'customer';

export const audienceContent = {
  en: {
    business: {
      eyebrow: 'Naitrust for business', title: 'Source wholesale products from China for your Nigerian business.', titleHighlight: 'for your Nigerian business.', description: 'A buying account for Nigerian retailers, traders, wholesalers and companies to work with a verified sourcing agent and manage China orders.', heroImage: pageImages.businessHero.src, heroAlt: pageImages.businessHero.alt, primary: 'Open a business account', register: 'register-business', sectionLabel: 'Who it is for', whoTitle: 'Give your business a clearer way to buy from China.', whoCopy: 'Choose a verified sourcing agent, share your requirements, approve quotes and follow each wholesale order from supplier checks to delivery in Nigeria.',
      useCases: [
        { icon: Store, title: 'Verified sourcing agents', text: 'Compare professionals operating in China by services, location and completed-order feedback.' },
        { icon: PackageCheck, title: 'Products and quotes', text: 'Share specifications and quantities, then review a complete sourcing and landed-cost quote.' },
        { icon: Building2, title: 'Supplier coordination', text: 'Once your agent sources a supplier, they invite the supplier into the Order Room, so pricing, evidence, approvals and payments stay clear for everyone.' },
        { icon: Users, title: 'Team visibility', text: 'Give your business one clear record of conversations, documents, payments and delivery progress.' },
      ],
      steps: [
        { icon: Fingerprint, title: 'Verify your business', text: 'Complete identity and business checks so agents and suppliers know who they are working with.' },
        { icon: Store, title: 'Choose a sourcing agent', text: 'Find a verified agent operating in China whose services match your product and order.' },
        { icon: ReceiptText, title: 'Approve your quote', text: 'Review quantities, specifications, agent services and the complete landed cost before paying.' },
        { icon: PackageCheck, title: 'Follow the order', text: 'Track supplier checks, production, shipping, customs and delivery in one Order Room.' },
      ],
    },
    customer: {
      eyebrow: 'Naitrust for customers', title: 'Find verified China suppliers and receive your order in Nigeria.', titleHighlight: 'receive your order in Nigeria.', description: 'Choose a verified sourcing agent operating in China, understand the complete landed cost, and track the order to your door in Nigeria.', heroImage: pageImages.customerHero.src, heroAlt: pageImages.customerHero.alt, primary: 'Open a customer account', register: 'register-customer', sectionLabel: 'More ways to use Naitrust', whoTitle: 'Import without relying on unknown suppliers or scattered agents.', whoCopy: 'Your sourcing agent helps find and check suitable China suppliers while Naitrust keeps quotes, approvals, evidence, payments and logistics together.',
      useCases: [
        { icon: Search, title: 'Find a sourcing agent', text: 'Compare verified agents operating in China by product expertise, services and location.' },
        { icon: Store, title: 'Share what you need', text: 'Give your agent the product, quantity, quality, budget and delivery requirements.' },
        { icon: ReceiptText, title: 'Receive a landed-cost quote', text: 'See products, inspection, customs, handling, insurance and logistics before paying.' },
        { icon: PackageCheck, title: 'Track delivery', text: 'Follow preparation, inspection, export, transit, customs and delivery from one Order Room.' },
      ],
      steps: [
        { icon: Search, title: 'Build a supplier cart', text: 'Choose products from one supplier, quantities, variants and delivery destination.' },
        { icon: ReceiptText, title: 'Approve the confirmed quote', text: 'Review the original supplier cost and the complete Naira payment total.' },
        { icon: Shield, title: 'Pay for the order', text: 'Pay the confirmed Naira quote while logistics costs remain clearly itemized.' },
        { icon: CheckCircle2, title: 'Review delivery', text: 'Confirm the delivered products at the agreed stage before supplier funds release.' },
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
  en: { how: 'See how it works', identity: 'Verified identity', quotes: 'Confirmed quotes', tracking: 'Order tracking', sourcing: 'Naitrust sourcing', tagline: 'Choose an agent. Source. Track.', howLabel: 'How it works', howTitle: 'A clear path from product idea to evidence-backed order.', imageCaption: 'The right order flow depends on where the supplier and delivery are located.', supportLabel: 'Agent-supported sourcing', routeTitle: 'One clear route from China to Nigeria.', chooseTitle: 'Choose a verified sourcing agent', chooseText: 'Compare agents operating in China and choose the right product expertise, services and location for your order.', recordTitle: 'Buy from China with a clear record', recordText: 'Keep supplier options, checks, quotes, approvals, payments, evidence and delivery progress in a shared Order Room.', ready: 'Ready to source without travelling?', readyText: 'Join a platform built around understandable evidence, verified human help and visible buyer approvals.' },
  'zh-CN': { how: '查看运作方式', identity: '身份已验证', quotes: '报价已确认', tracking: '订单跟踪', sourcing: 'Naitrust 采购', tagline: '选择代理，采购并跟踪。', howLabel: '运作方式', howTitle: '从产品想法到有证据支持的订单，路径清晰。', imageCaption: '正确的订单流程取决于供应商和配送地点。', supportLabel: '代理协助采购', routeTitle: '从中国到尼日利亚，一条清晰路径。', chooseTitle: '选择已验证采购代理', chooseText: '比较在中国运营的代理，为订单选择合适的产品专长、服务和地点。', recordTitle: '从中国采购并保留清晰记录', recordText: '在共享订单室中保存供应商选项、核查、报价、审批、付款、证据和配送进度。', ready: '准备好无需出行即可采购？', readyText: '加入一个围绕易懂证据、已验证人工协助和清晰买家审批打造的平台。' },
} as const;
