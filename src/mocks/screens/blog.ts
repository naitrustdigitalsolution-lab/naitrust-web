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
    slug: "what-makes-a-high-value-transaction-safer",
    category: "Safe Deals",
    title: "What makes a high-value transaction safer?",
    summary:
      "A practical guide to identity, clear terms and useful evidence before money moves.",
    image: "/images/blog/safer-deals.png",
    imageAlt:
      "Nigerian customer and business owner reviewing transaction details",
    readTime: "5 min read",
    publishedAt: "13 July 2026",
    intro:
      "A serious transaction needs more than a payment screenshot. Safety begins when both sides know who is involved, understand the agreement and can show what happened.",
    sections: [
      {
        heading: "Start with the counterparty",
        paragraphs: [
          "A business name, social profile or phone number is not enough on its own. Buyers and sellers should understand who controls the account and who is responsible for the deal.",
        ],
        points: [
          "Confirm names and contact details",
          "Check the person’s role in the transaction",
          "Be cautious when payment instructions change unexpectedly",
        ],
      },
      {
        heading: "Write down the agreement",
        paragraphs: [
          "Price, quantity, condition, deadlines and delivery expectations should be visible to both sides before payment. Clear terms reduce avoidable disputes.",
        ],
      },
      {
        heading: "Keep evidence connected",
        paragraphs: [
          "Invoices, receipts, inspection photos, waybills and completion approvals are more useful when they remain connected to the same transaction record.",
        ],
      },
    ],
  },
  {
    slug: "business-verification-what-buyers-should-check",
    category: "Verification",
    title: "Business verification: what buyers should actually check",
    summary:
      "Registration is a useful starting point, but it is not the whole trust decision.",
    image: "/images/blog/business-verification.png",
    imageAlt:
      "Nigerian business owner reviewing identity and business documents",
    readTime: "6 min read",
    publishedAt: "13 July 2026",
    intro:
      "Verification helps confirm specific facts at a specific time. It should support good judgment, not replace it.",
    sections: [
      {
        heading: "Confirm the business and representative",
        paragraphs: [
          "Check that the business information is consistent and that the person speaking for it appears authorised to do so.",
        ],
      },
      {
        heading: "Match verification to the risk",
        paragraphs: [
          "A small purchase may need fewer checks than a bulk supplier order or property deposit. Stronger risk should lead to stronger evidence.",
        ],
        points: [
          "Business registration information",
          "Representative identity",
          "Relevant address or contact information",
          "Recent transaction-specific evidence",
        ],
      },
      {
        heading: "Understand the limit",
        paragraphs: [
          "A verification result does not guarantee honesty, delivery, quality or solvency. Always review the terms and evidence for the particular transaction.",
        ],
      },
    ],
  },
  {
    slug: "before-you-pay-a-new-supplier",
    category: "Buyer Guides",
    title: "Before you pay a new supplier: a practical checklist",
    summary:
      "The questions and evidence worth collecting before a large supplier transfer.",
    image: "/images/blog/safer-deals.png",
    imageAlt: "Buyer and supplier reviewing an order together",
    readTime: "4 min read",
    publishedAt: "13 July 2026",
    intro:
      "Supplier risk becomes expensive when the buyer discovers missing details only after making payment.",
    sections: [
      {
        heading: "Clarify the order",
        paragraphs: [
          "Record the exact products, quantities, condition, total amount and delivery deadline.",
        ],
        points: [
          "Quotation or invoice",
          "Stock or inspection evidence",
          "Delivery location and recipient",
          "Refund or replacement expectations",
        ],
      },
      {
        heading: "Confirm payment instructions",
        paragraphs: [
          "Make sure the account details are connected to the supplier or an explained authorised recipient. Reconfirm unexpected changes through a separate trusted channel.",
        ],
      },
      {
        heading: "Plan for delivery evidence",
        paragraphs: [
          "Agree what will prove dispatch and successful delivery before the goods move.",
        ],
      },
    ],
  },
  {
    slug: "how-honest-businesses-prove-reliability-online",
    category: "Seller Guides",
    title: "How honest businesses can prove reliability online",
    summary:
      "Build customer confidence with consistency, evidence and completed transaction history.",
    image: "/images/blog/business-verification.png",
    imageAlt: "Nigerian business professional working at a desk",
    readTime: "5 min read",
    publishedAt: "13 July 2026",
    intro:
      "Trust grows when customers can verify consistent facts and see evidence of how a business handles real transactions.",
    sections: [
      {
        heading: "Keep business details consistent",
        paragraphs: [
          "Use the same business name, contact information and payment explanation across the channels customers rely on.",
        ],
      },
      {
        heading: "Make terms easy to understand",
        paragraphs: [
          "Clearly state price, delivery, returns and what the customer should expect next.",
        ],
      },
      {
        heading: "Use completion as proof",
        paragraphs: [
          "A structured history of completed deals can become stronger evidence than unsupported claims or screenshots selected without context.",
        ],
      },
    ],
  },
  {
    slug: "why-screenshots-are-weak-transaction-evidence",
    category: "Fraud Prevention",
    title: "Why screenshots alone are weak transaction evidence",
    summary:
      "Screenshots help, but they rarely explain the complete transaction story.",
    image: "/images/blog/delivery-evidence.png",
    imageAlt: "Customer confirming delivery of a packaged order",
    readTime: "4 min read",
    publishedAt: "13 July 2026",
    intro:
      "A screenshot can be cropped, edited or separated from the conversation that gives it meaning. Stronger evidence is connected and chronological.",
    sections: [
      {
        heading: "Context matters",
        paragraphs: [
          "A useful record shows who created the information, when it happened and how it relates to the agreed terms.",
        ],
      },
      {
        heading: "Combine different evidence",
        paragraphs: [
          "No single file proves everything. A stronger record may combine an agreement, invoice, payment status, delivery evidence and confirmation.",
        ],
      },
      {
        heading: "Preserve the timeline",
        paragraphs: [
          "Keeping events in order makes it easier for both sides to understand what happened if a disagreement occurs.",
        ],
      },
    ],
  },
  {
    slug: "one-trusted-record-for-every-deal",
    category: "Product",
    title: "Building Naitrust: one trusted record for every deal",
    summary:
      "Why Naitrust is bringing identity, terms, status and evidence into one workflow.",
    image: "/images/blog/delivery-evidence.png",
    imageAlt:
      "Nigerian customer reviewing delivery details while receiving an order",
    readTime: "3 min read",
    publishedAt: "13 July 2026",
    intro:
      "Many Nigerian transactions begin in chats and end in bank transfers, with the important details scattered between them. Naitrust is being designed to make that record clearer.",
    sections: [
      {
        heading: "The problem with scattered deals",
        paragraphs: [
          "Identity sits in one place, terms in another, payment elsewhere and delivery evidence in a different chat. That fragmentation creates confusion.",
        ],
      },
      {
        heading: "What Naitrust is working toward",
        paragraphs: [
          "The intended product brings the parties, agreement, payment status, evidence and completion record into one shared flow.",
        ],
      },
      {
        heading: "Launching responsibly",
        paragraphs: [
          "Naitrust is currently accepting waiting-list registrations. Features will be described with clear limits before they become publicly available.",
        ],
      },
    ],
  },
];
