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
    "slug": "clear-terms-before-payment",
    "category": "Protected Deals",
    "title": "What should buyers and sellers agree before payment?",
    "summary": "A practical starting point for the amount, deliverables, evidence and release conditions.",
    "image": "/images/blog/trust-in-conversation-v1.webp",
    "imageAlt": "A buyer and seller smiling as they review an agreement together",
    "readTime": "2 min read",
    "publishedAt": "19 September 2026",
    "intro": "A practical starting point for the amount, deliverables, evidence and release conditions.",
    "sections": [
      {
        "heading": "Describe the promise",
        "paragraphs": [
          "Record what is being bought or delivered, the price, the deadline and the people responsible. Both sides should review the same description before proceeding."
        ]
      },
      {
        "heading": "Agree how completion will be shown",
        "paragraphs": [
          "Choose evidence relevant to the deal: an invoice, delivery record, photographs or confirmation of completed work. Keep the agreement and evidence together so neither side needs to reconstruct the deal from scattered chats."
        ]
      },
      {
        "heading": "Make release conditions clear",
        "paragraphs": [
          "Set out when payment may be released and how an issue should be raised. Naitrust is being built to connect these decisions in one Deal Room. Live payment services depend on approved providers and launch readiness."
        ]
      }
    ]
  },
  {
    "slug": "payment-confidence-for-sellers",
    "category": "For sellers",
    "title": "Payment confidence matters to sellers too",
    "summary": "Why confirmed funding, agreed deliverables and a shared record matter on both sides.",
    "image": "/images/blog/trust-in-every-handover-v1.webp",
    "imageAlt": "A shop owner handing a carefully wrapped parcel to a customer",
    "readTime": "2 min read",
    "publishedAt": "19 September 2026",
    "intro": "Why confirmed funding, agreed deliverables and a shared record matter on both sides.",
    "sections": [
      {
        "heading": "Know the funding status",
        "paragraphs": [
          "Before fulfilling a deal, a seller needs a reliable funding confirmation. A screenshot from another participant is not a substitute for a confirmed payment status from the payment provider."
        ]
      },
      {
        "heading": "Keep evidence of fulfilment",
        "paragraphs": [
          "Attach relevant delivery or work evidence to the agreed terms. Clear records help the buyer review the outcome and give both parties context if an issue arises."
        ]
      },
      {
        "heading": "Understand the release process",
        "paragraphs": [
          "A Protected Deal should explain the release conditions before either side commits. Payment timing and any review depend on those conditions and provider rules. Protection is a process, not a guarantee of every outcome."
        ]
      }
    ]
  },
  {
    "slug": "one-shared-deal-room",
    "category": "Product updates",
    "title": "Why we are building one shared Deal Room",
    "summary": "An agreement, its evidence and its payment status belong together.",
    "image": "/images/blog/trust-on-the-same-page-v1.webp",
    "imageAlt": "Three collaborators reviewing a laptop together in a bright studio",
    "readTime": "2 min read",
    "publishedAt": "19 September 2026",
    "intro": "An agreement, its evidence and its payment status belong together.",
    "sections": [
      {
        "heading": "A record both sides can follow",
        "paragraphs": [
          "Informal deals often spread terms, invoices and delivery updates across different conversations. A shared Deal Room connects those records to the payment they describe."
        ]
      },
      {
        "heading": "Clarity when something changes",
        "paragraphs": [
          "Keep questions, supporting files and approvals attached to the same deal. If there is a disagreement, both sides can refer to the accepted terms and submit relevant evidence for review."
        ]
      },
      {
        "heading": "What comes next",
        "paragraphs": [
          "Naitrust is currently accepting early access interest for buyers, sellers and businesses in Nigeria. The planned pilot uses a single payment release. Live funding, release and refunds require approved payment provider integrations."
        ]
      }
    ]
  }
];
