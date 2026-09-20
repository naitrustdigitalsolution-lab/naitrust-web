export const LEGAL_TERMS_VERSION = '2026-09-20-room-access-v2';
export const LEGAL_SHARING_SCOPE = 'deal_documents' as const;

export const legalTermsSections = [
  { heading: 'One approval for this room', body: 'Both parties appoint the named legal reviewer for this deal. You authorise Naitrust to share the agreement, existing evidence and all future documents uploaded to this room for the stated review purpose. New uploads become available automatically, without another approval.' },
  { heading: 'Access and responsibilities', body: 'The reviewer can read shared documents, receive review requests and post findings. Private messages, account banking details and identity captures remain outside this access. A document you upload may itself contain sensitive information, so review it before adding it to the shared room. The reviewer cannot release money or decide a dispute. Findings do not guarantee authenticity or an outcome.' },
  { heading: 'Legal fee', body: 'The deal payer pays the additional percentage and exact amount shown below. Assignment is automatic after both parties approve; document access starts once the legal fee is paid. Future uploads do not attract another legal fee. All payments in this preview are simulated.' },
  { heading: 'Deactivating legal access', body: 'Either party may request deactivation. Access continues until both parties confirm, including access to the retained room record after deal completion. Naitrust may restrict access if the provider is revoked or an account is suspended. Deactivation cannot recall copies already obtained. Contact Naitrust for a privacy concern or an urgent access review.' },
];
