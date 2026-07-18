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
    image: '/images/blog/safer-deals.png', imageAlt: 'Nigerian property participants reviewing transaction information', readTime: '5 min read', publishedAt: '18 July 2026',
    intro: 'A property transaction needs more than a transfer receipt. Clarity begins when everyone can identify the property and participants, understand the agreement, and review what happened.',
    sections: [
      { heading: 'Identify the property and participants', paragraphs: ['Record the property description and the people or companies involved, including who claims to be the owner, agent, developer, buyer, seller, or representative.'], points: ['Confirm names and contact details', 'Record each participant’s claimed role', 'Ask who is authorised to receive payments'] },
      { heading: 'Document the agreement', paragraphs: ['The price, deposit, payment plan, documents, milestones, responsibilities, and completion conditions should be visible before a substantial payment is made.'] },
      { heading: 'Keep evidence connected', paragraphs: ['Offers, allocation letters, receipts, inspections, property documents, messages, and confirmations are more useful when they remain connected to the same transaction history.'] },
    ],
  },
  {
    slug: 'property-company-verification-what-buyers-should-check', category: 'Verification',
    title: 'Property company verification: what buyers should check',
    summary: 'Company registration is useful, but buyers should also understand representatives, authority, property details, and transaction evidence.',
    image: '/images/blog/business-verification.png', imageAlt: 'Nigerian property professional reviewing company and identity documents', readTime: '6 min read', publishedAt: '18 July 2026',
    intro: 'Verification confirms particular information at a point in time. It supports careful property decisions but does not replace legal, document, or physical due diligence.',
    sections: [
      { heading: 'Confirm the company and representative', paragraphs: ['Check that company information is consistent and that the person communicating appears connected to or authorised by the company.'] },
      { heading: 'Match checks to the transaction', paragraphs: ['A viewing request and a major property payment do not carry the same risk. Higher-value commitments should lead to stronger identity, authority, document, and payment checks.'], points: ['Company registration information', 'Representative identity and role', 'Property and location details', 'Transaction-specific documents and receipts'] },
      { heading: 'Understand the limits', paragraphs: ['Verification does not guarantee ownership, authority, title quality, honesty, solvency, or the outcome of a property transaction. Obtain appropriate independent professional advice.'] },
    ],
  },
  {
    slug: 'before-paying-property-deposit', category: 'Buyer Guides',
    title: 'Before paying a property deposit: a practical checklist',
    summary: 'Questions and records worth collecting before a reservation, agency, land, or property payment.',
    image: '/images/blog/safer-deals.png', imageAlt: 'Property buyer reviewing payment and property details', readTime: '5 min read', publishedAt: '18 July 2026',
    intro: 'Property-payment risk becomes expensive when important details are discovered only after money has moved.',
    sections: [
      { heading: 'Clarify what the payment is for', paragraphs: ['Record the property, recipient, exact purpose, amount, deadline, and whether the payment is refundable or conditional.'], points: ['Property description and location', 'Offer or payment request', 'Recipient and their role', 'Refund and next-step conditions'] },
      { heading: 'Confirm payment instructions', paragraphs: ['Understand why the named account should receive the payment. Reconfirm unexpected account changes through a separate trusted channel.'] },
      { heading: 'Plan the evidence trail', paragraphs: ['Agree which receipt, acknowledgement, allocation, agreement, or milestone should follow the payment and keep it with the transaction record.'] },
    ],
  },
  {
    slug: 'how-property-companies-build-buyer-confidence', category: 'Property Companies',
    title: 'How property companies can build buyer confidence',
    summary: 'Create a professional buyer experience with consistent identity, terms, payment records, documents, and milestones.',
    image: '/images/blog/business-verification.png', imageAlt: 'Nigerian real estate professional preparing a buyer transaction record', readTime: '5 min read', publishedAt: '18 July 2026',
    intro: 'Confidence grows when buyers can verify consistent facts and understand what should happen throughout a property transaction.',
    sections: [
      { heading: 'Keep company and representative details consistent', paragraphs: ['Use consistent company, contact, representative, and payment information across the channels buyers rely on.'] },
      { heading: 'Make transaction terms understandable', paragraphs: ['Clearly explain the property, price, payment plan, promised documents, milestones, responsibilities, and next action.'] },
      { heading: 'Use completion history responsibly', paragraphs: ['A structured history of completed property transactions can be more useful than unsupported claims or isolated screenshots.'] },
    ],
  },
  {
    slug: 'why-screenshots-are-weak-property-evidence', category: 'Transaction Evidence',
    title: 'Why screenshots alone are weak property transaction evidence',
    summary: 'Screenshots can help, but they rarely explain the complete property transaction history.',
    image: '/images/blog/delivery-evidence.png', imageAlt: 'Property participant organising transaction documents and evidence', readTime: '4 min read', publishedAt: '18 July 2026',
    intro: 'A screenshot can be cropped, edited, or separated from the context that gives it meaning. Stronger evidence is connected and chronological.',
    sections: [
      { heading: 'Context matters', paragraphs: ['A useful record shows who supplied information, when it happened, and how it relates to the property and agreed terms.'] },
      { heading: 'Combine different evidence', paragraphs: ['No single file proves everything. A clearer record may combine participant details, an agreement, receipts, property documents, inspection evidence, and confirmations.'] },
      { heading: 'Preserve the timeline', paragraphs: ['Keeping activity in order helps participants and advisers understand what occurred if a disagreement develops.'] },
    ],
  },
  {
    slug: 'one-record-for-property-transaction', category: 'Product',
    title: 'Building Naitrust: one record for a property transaction',
    summary: 'Why Naitrust is bringing participants, agreements, payments, documents, milestones, and evidence into one workflow.',
    image: '/images/blog/delivery-evidence.png', imageAlt: 'Nigerian property buyer reviewing a digital transaction record', readTime: '3 min read', publishedAt: '18 July 2026',
    intro: 'Many Nigerian property transactions begin in chats and continue through bank transfers and documents shared across several channels. Naitrust is being designed to make that history clearer.',
    sections: [
      { heading: 'The problem with fragmented records', paragraphs: ['Participant identity sits in one place, terms in another, payment elsewhere, and property documents in a different chat. That fragmentation creates avoidable uncertainty.'] },
      { heading: 'What Naitrust is working toward', paragraphs: ['The intended product brings the property, participants, agreement, payment status, documents, milestones, supporting evidence, and completion record into one shared flow.'] },
      { heading: 'Launching responsibly', paragraphs: ['Naitrust is currently accepting property early-access registrations. Features and their limits will be described clearly before they become publicly available.'] },
    ],
  },
];
