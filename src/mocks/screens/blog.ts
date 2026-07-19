export interface BlogArticle {
  slug: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  readTime: string;
  publishedAt: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[]; points?: string[] }>;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'what-makes-a-property-transaction-clearer', category: 'Property Transactions',
    title: 'What makes a property transaction clearer?',
    summary: 'A practical guide to participants, terms, payments, property documents, and evidence before money moves.',
    image: '/images/blog/safer-deals.png', imageAlt: 'Nigerian property participants reviewing transaction information', readTime: '8 min read', publishedAt: '18 July 2026',
    intro: 'A property transaction needs more than a transfer receipt. Clarity begins when everyone involved can identify the property and each other, understand exactly what was agreed, and review what actually happened at every stage — not just at the end.',
    sections: [
      {
        heading: 'Identify the property and every participant',
        paragraphs: [
          'A single Nigerian property transaction can involve more people than a buyer first expects: the registered owner, a family selling land held communally, one or more agents, a developer’s sales representative, and sometimes a family head or “next of kin” asserting authority over inherited land. Before any payment moves, it is worth writing down exactly who is involved and what each person claims their role to be.',
          'This matters because authority to show a property and authority to collect payment are not always held by the same person. An agent may be permitted to arrange viewings but not to receive a deposit; a family representative may claim to speak for co-owners who have not actually agreed to sell. Recording each participant’s name, contact details, and claimed role creates a reference point everyone — including a lawyer, if a disagreement later needs one — can return to.',
        ],
        points: [
          'Confirm the full name and contact details of everyone involved',
          'Record each participant’s claimed role (owner, agent, developer, family representative)',
          'Get written confirmation of who is authorised to receive payment on the seller’s side',
          'If a company is involved, note who is signing on its behalf and in what capacity',
        ],
      },
      {
        heading: 'Put the agreed terms in writing before money moves',
        paragraphs: [
          'Verbal agreements are hard to enforce and easy to misremember months later. The price, deposit amount, payment schedule, and what happens if either side pulls out should exist as text that both parties can point back to — not as a shared memory of a conversation.',
          'For land and property purchases, the agreement should describe what is being sold precisely enough to remove ambiguity: plot size, boundaries or beacon references, and any existing structures. For developer instalment plans, the schedule should state what happens to payments already made if construction is delayed — one of the most common sources of dispute in Nigerian real estate.',
        ],
      },
      {
        heading: 'Understand what you are actually paying for',
        paragraphs: [
          'Property payments in Nigeria are rarely a single transfer. A typical purchase can include a reservation fee, a deposit, agency commission, legal fees, survey costs, and — for titled land — charges connected to obtaining or perfecting a Certificate of Occupancy or Governor’s Consent. Each of these is worth itemising rather than accepting as one bundled figure.',
          'When a payment is described as “refundable” or “non-refundable,” get the exact condition in writing at the time the payment is made, not after a disagreement has already started. If an agent or developer cannot explain clearly what a specific payment covers, treat that as a signal to slow down and ask further questions before proceeding.',
        ],
      },
      {
        heading: 'Keep documents connected to the transaction, not scattered across chats',
        paragraphs: [
          'Offer letters, allocation letters, receipts, survey plans, and correspondence about the property are far more useful when they can be reviewed together, in the order they happened, than when they are spread across WhatsApp threads, email, and paper receipts kept in different places.',
          'A connected record also makes inconsistencies easier to notice early — for example, if the property description on a receipt does not match the one in the original offer, or if a promised document never actually arrives.',
        ],
        points: [
          'Offer or allocation letter',
          'Receipts for every payment made, however small',
          'Survey plan or site plan, where one exists',
          'Written confirmation of any specific promise (completion date, documents to follow, refund conditions)',
        ],
      },
      {
        heading: 'Track milestones instead of waiting for one “completion” moment',
        paragraphs: [
          'Property transactions — particularly off-plan purchases and instalment plans — happen in stages: allocation, part-payment, construction or documentation milestones, and handover. Treating each stage as something to confirm as it happens, rather than waiting until the very end to check on progress, makes problems easier to catch while they are still solvable.',
          'This is the structural gap Naitrust is being designed to close — not by acting as an estate agent, title registry, or valuer, but by giving the participants in a transaction one shared, chronological record of what was agreed, what has been paid, what documents exist, and what stage the transaction has actually reached.',
        ],
      },
    ],
  },
  {
    slug: 'property-company-verification-what-buyers-should-check', category: 'Verification',
    title: 'Property company verification: what buyers should check',
    summary: 'Company registration is useful, but buyers should also understand representatives, authority, property details, and transaction evidence.',
    image: '/images/blog/business-verification.png', imageAlt: 'Nigerian property professional reviewing company and identity documents', readTime: '7 min read', publishedAt: '18 July 2026',
    intro: 'Verification confirms specific information at a specific point in time. Used well, it supports a more careful property decision — but it is one input among several, not a replacement for legal, document, or physical due diligence.',
    sections: [
      {
        heading: 'Start with the basics: does the company exist as it claims?',
        paragraphs: [
          'CAC (Corporate Affairs Commission) registration is the starting point, not the finish line. Confirm the registered company name and registration number match what appears on marketing material, the company’s website, and the offer document. Even a small mismatch is worth raising directly with the company rather than assuming it is a typo.',
          'Some developers and agencies market under a brand name that differs from their registered company name. That is not automatically a problem, but the connection between the brand and the registered entity should be explained and confirmed — not simply assumed because the marketing looks professional.',
        ],
      },
      {
        heading: 'Confirm the representative and their authority',
        paragraphs: [
          'A company search can confirm the business exists; it cannot confirm that the specific person you are speaking to is authorised to negotiate price, make promises, or collect payment on the company’s behalf. Ask for something in writing that connects the individual to the company — a staff ID, a signed letter of authorisation, or a role that the company itself confirms.',
          'This step matters most at the exact moment money is about to move. A person can be genuinely employed by a legitimate company and still not be the person authorised to receive a specific payment.',
        ],
      },
      {
        heading: 'Match the level of checking to the size of the payment',
        paragraphs: [
          'A viewing appointment and a seven-figure deposit do not carry the same risk, and they should not receive the same level of scrutiny. As the amount and commitment increase, so should the checks applied before money moves.',
        ],
        points: [
          'Company registration information',
          'Representative identity and role',
          'The specific property and its location',
          'Transaction-specific documents and receipts, not generic marketing material',
        ],
      },
      {
        heading: 'Understand what verification does not tell you',
        paragraphs: [
          'Confirming a company is registered does not confirm that it owns the land it is selling, that its title documents are genuine, that it holds the planning approvals it claims, or that it will deliver on time. Those questions typically require separate legal, survey, and physical due diligence — usually through a property lawyer and a search at the relevant land registry.',
          'Naitrust’s verification checks are one input among several. They are not a substitute for independent legal advice on title, and should never be treated as a guarantee of a company’s honesty, solvency, or the outcome of a transaction.',
        ],
      },
      {
        heading: 'What to do when something does not match',
        paragraphs: [
          'If registration details, representative authority, or property information do not line up, the safer response is almost always to pause and get clarification in writing before any payment is made — not to proceed on the assumption that it can be resolved afterward.',
        ],
      },
    ],
  },
  {
    slug: 'before-paying-property-deposit', category: 'Buyer Guides',
    title: 'Before paying a property deposit: a practical checklist',
    summary: 'Questions and records worth collecting before a reservation, agency, land, or property payment.',
    image: '/images/blog/safer-deals.png', imageAlt: 'Property buyer reviewing payment and property details', readTime: '7 min read', publishedAt: '18 July 2026',
    intro: 'Property-payment risk usually becomes expensive for one simple reason: an important detail is discovered only after the money has already moved. Most of that risk can be reduced with a short set of checks done beforehand.',
    sections: [
      {
        heading: 'Know exactly what the payment is for',
        paragraphs: [
          'Before paying anything, record the property, the recipient, the exact purpose of the payment, the amount, the deadline, and whether the payment is refundable or conditional. “Deposit,” “reservation fee,” and “equity contribution” are not interchangeable — each can carry different refund rights, and the difference should be written down at the time of payment, not assumed.',
        ],
        points: [
          'Property description and location',
          'The offer or payment request itself',
          'The recipient and their claimed role',
          'Refund and next-step conditions, in writing',
        ],
      },
      {
        heading: 'Confirm who should receive the money — then confirm it again',
        paragraphs: [
          'One of the most common property-related frauds in Nigeria involves a bank account number changing between an initial conversation and the point of payment — often through an intercepted email or a compromised WhatsApp account. If account details change, or arrive for the first time close to a payment deadline, reconfirm them through a separate channel: a phone call to a previously known number, not a reply to the same message thread the new details arrived in.',
          'This single habit — reconfirming payment details out-of-band — closes off one of the most damaging and most preventable failure points in property transactions.',
        ],
      },
      {
        heading: 'Recognise pressure as a signal to slow down, not speed up',
        paragraphs: [
          '“Another buyer is interested,” “the price increases tomorrow,” or “payment must be made today to secure the unit” are common in genuine sales and are not, by themselves, proof of anything wrong. But they should never replace the verification steps that would otherwise be taken — they should prompt more caution, not less.',
        ],
      },
      {
        heading: 'Decide what “refundable” actually means, in writing',
        paragraphs: [
          'If a payment is described as refundable, the conditions under which a refund would actually be honoured should be written down before payment, including timeframes and any deductions. Refund promises made verbally and only remembered later are one of the hardest things to resolve in a dispute.',
        ],
      },
      {
        heading: 'Plan the evidence trail before, not after, paying',
        paragraphs: [
          'Agree in advance which receipt, acknowledgement, allocation letter, or milestone confirmation should follow the payment, and keep it attached to the rest of the transaction record rather than as an isolated screenshot. A payment without a corresponding, connected confirmation is far harder to act on later if something goes wrong.',
        ],
      },
    ],
  },
  {
    slug: 'how-property-companies-build-buyer-confidence', category: 'Property Companies',
    title: 'How property companies can build buyer confidence',
    summary: 'Create a professional buyer experience with consistent identity, terms, payment records, documents, and milestones.',
    image: '/images/blog/business-verification.png', imageAlt: 'Nigerian real estate professional preparing a buyer transaction record', readTime: '6 min read', publishedAt: '18 July 2026',
    intro: 'Buyer confidence is rarely won with a single reassurance. It is built from consistent, checkable facts and a clear sense of what should happen next at every stage of a property transaction.',
    sections: [
      {
        heading: 'Be consistent everywhere a buyer can find you',
        paragraphs: [
          'Company name, registration details, contact information, representative names, and payment instructions should match across your website, marketing material, offer documents, and the messages your sales team sends. Buyers increasingly cross-check these details before paying, and inconsistencies — even small, innocent ones — are read as risk signals.',
        ],
      },
      {
        heading: 'Explain the payment plan in plain language, not sales language',
        paragraphs: [
          'A buyer should be able to state, in their own words, what each payment is for, when the next one is due, and what happens if a payment or a milestone slips. If that explanation depends on a sales pitch rather than a written schedule, the plan is not yet clear enough to build confidence.',
        ],
      },
      {
        heading: 'Put promises in writing, including timelines',
        paragraphs: [
          'Verbal completion dates, verbal promises about documents “to follow,” and verbal assurances about site progress are the first thing a buyer loses confidence in in the event of a delay. Written timelines — even conservative ones — hold up better than optimistic verbal ones, and are easier for both sides to refer back to.',
        ],
      },
      {
        heading: 'Make your completion history checkable, not just claimed',
        paragraphs: [
          'A structured record of previously completed transactions — participants, terms, payments, and confirmed handovers — is more persuasive than unsupported claims of experience or isolated screenshots shared as proof. Where possible, let genuinely completed transactions speak through evidence rather than marketing copy.',
        ],
      },
      {
        heading: 'Treat early questions as normal, not as distrust',
        paragraphs: [
          'Buyers asking about registration, representative authority, or refund conditions before paying are not signalling suspicion of your company specifically — they are applying the same caution the Nigerian property market has taught them to apply everywhere. Companies that answer these questions clearly and quickly, rather than treating them as an inconvenience, tend to close transactions with fewer disputes later.',
        ],
      },
    ],
  },
  {
    slug: 'why-screenshots-are-weak-property-evidence', category: 'Transaction Evidence',
    title: 'Why screenshots alone are weak property transaction evidence',
    summary: 'Screenshots can help, but they rarely explain the complete property transaction history.',
    image: '/images/blog/delivery-evidence.png', imageAlt: 'Property participant organising transaction documents and evidence', readTime: '6 min read', publishedAt: '18 July 2026',
    intro: 'A screenshot can be cropped, edited, taken out of order, or separated entirely from the context that gave it meaning. Stronger property evidence is connected, dated, and kept in the sequence it actually happened.',
    sections: [
      {
        heading: 'A screenshot only shows a moment, not a relationship',
        paragraphs: [
          'A single image of a bank transfer, a chat message, or a receipt proves that something existed at one point — it does not, by itself, prove what it was for, who agreed to it, or what came before or after. Without that surrounding context, a screenshot is a fragment rather than a record.',
        ],
      },
      {
        heading: 'Context is what turns a fragment into usable evidence',
        paragraphs: [
          'A useful record shows who supplied information, when it happened, and how it connects to the property and the agreed terms — not just that a payment or message occurred. The same transfer receipt means something very different depending on whether it is connected to an offer document and a payment schedule, or standing alone with no explanation attached.',
        ],
      },
      {
        heading: 'Combine different evidence types instead of relying on one',
        paragraphs: [
          'No single file proves everything in a property transaction. A clearer record typically combines participant details, the written agreement, payment receipts, property documents, inspection evidence, and completion confirmations — each covering a gap the others leave open.',
        ],
        points: [
          'Participant identity and claimed role',
          'The written agreement or offer',
          'Payment receipts, matched to specific milestones',
          'Property documents and inspection evidence',
        ],
      },
      {
        heading: 'Preserve the timeline, not just the individual files',
        paragraphs: [
          'The order events happened in is often as important as the events themselves. Keeping activity in chronological sequence — rather than as a folder of unordered images — makes it far easier for participants, and for any lawyer or adviser involved later, to understand what actually occurred if a disagreement develops.',
        ],
      },
      {
        heading: 'What this means when a disagreement happens',
        paragraphs: [
          'When a property transaction is disputed, the side with a connected, chronological record — participants, terms, payments, and documents that reference each other — is in a materially stronger position than the side holding a folder of disconnected screenshots, regardless of how many screenshots they have.',
        ],
      },
    ],
  },
  {
    slug: 'one-record-for-property-transaction', category: 'Product',
    title: 'Building Naitrust: one record for a property transaction',
    summary: 'Why Naitrust is bringing participants, agreements, payments, documents, milestones, and evidence into one workflow.',
    image: '/images/blog/delivery-evidence.png', imageAlt: 'Nigerian property buyer reviewing a digital transaction record', readTime: '5 min read', publishedAt: '18 July 2026',
    intro: 'Many Nigerian property transactions begin in a chat, continue through one or more bank transfers, and produce documents that end up scattered across email, WhatsApp, and paper. Naitrust is being designed to make that history clearer, from the first conversation to completion.',
    sections: [
      {
        heading: 'Where Nigerian property transactions currently break down',
        paragraphs: [
          'Participant identity sits in one place, the agreed terms in another, payment evidence somewhere else, and property documents in a different conversation entirely. Each piece may be perfectly legitimate on its own, but the fragmentation between them is exactly where uncertainty — and eventually disputes — tend to develop.',
          'This is especially visible in instalment purchases and off-plan sales, where a transaction can run for months or years, involve multiple payments, and pass through several points of contact on the seller’s side.',
        ],
      },
      {
        heading: 'What one shared record is intended to include',
        paragraphs: [
          'The product Naitrust is building brings the property, the participants and their roles, the agreed terms, payment status, supporting documents, transaction milestones, and any evidence gathered along the way into a single shared flow that every participant in the transaction can access and refer back to.',
        ],
      },
      {
        heading: 'What Naitrust is not building',
        paragraphs: [
          'Naitrust is not a property marketplace, estate agent, title registry, law firm, surveyor, valuer, or bank. It does not list or sell properties, confirm land ownership, or guarantee that a transaction will complete successfully. It is intended to be the shared record participants use around a transaction they have already entered into — not a substitute for legal, survey, or title due diligence.',
        ],
      },
      {
        heading: 'Where things stand today',
        paragraphs: [
          'Naitrust is currently accepting early-access registrations for the Nigerian property market. Features, their limits, and what they do and do not cover will be described clearly before anything becomes publicly available, and this blog will continue to reflect the product as it actually exists rather than as it is hoped to become.',
        ],
      },
    ],
  },
];
