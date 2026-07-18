import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, FileText, Globe, Scale } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
  userType?: 'customer' | 'business' | 'admin' | 'business-member' | null;
  userId?: string | null;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate, userType, userId }) => {
  return (
    <div className="min-h-screen bg-background relative py-12">
      <SEOHead
        title="Privacy Policy"
        description="Learn how Naitrust handles personal data for property early access, participant verification, and property transaction records under Nigerian data-protection requirements."
        canonicalPath="/privacy"
        noindex={false}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="bg-muted/30 rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-[#031335] px-6 py-12 text-center text-white dark:bg-[#0A0E1A]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2">Privacy Policy</h1>
            <p className="text-blue-200">Effective Date: 1st January 2026 &middot; Last Updated: 11th July 2026</p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-muted-foreground mb-4">
              This Privacy Policy ("Policy") explains how Naitrust Digital Solutions Limited ("Naitrust", "we", "us", or "our"), 
              a company incorporated under the Companies and Allied Matters Act (CAMA) 2020 with its registered office in 
              Lagos, Nigeria, collects, uses, stores, discloses, and protects your personal data when you use the Naitrust 
              property transaction platform and early-access website at naitrust.com ("Platform").
            </p>
            <p className="text-muted-foreground mb-4">
              This Policy is issued in compliance with the Nigeria Data Protection Act (NDPA) 2023, the Nigeria Data Protection 
              Regulation (NDPR) 2019 as issued by the National Information Technology Development Agency (NITDA), and all 
              applicable data protection laws and regulations of the Federal Republic of Nigeria.
            </p>
            <p className="text-muted-foreground">
              By creating an account, accessing, or using the Platform, you acknowledge that you have read, understood, and 
              consent to the collection and processing of your personal data in accordance with this Policy. If you do not 
              agree with any provision of this Policy, you must discontinue use of the Platform immediately.
            </p>
          </section>

          {/* Data Controller */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">1. Data Controller</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-2">
                For the purposes of the NDPA 2023 and NDPR 2019, Naitrust Digital Solutions Limited is the data controller 
                responsible for the processing of your personal data. Our Data Protection Officer can be contacted at:
              </p>
              <div className="p-4 rounded-lg space-y-1 border-2 mt-2">
                <p><strong>Data Protection Officer:</strong> dpo@naitrust.com</p>
                <p><strong>Registered Address:</strong> Lagos, Nigeria</p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">2. Categories of Personal Data Collected</h2>
            </div>
            
            <div className="ml-8 space-y-4">
              <div>
                <h3 className="text-lg mb-2">2.1 Identity and Registration Data</h3>
                <p className="text-muted-foreground mb-2">When you register on Naitrust, we collect:</p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>Full legal name and business name (for business accounts)</li>
                  <li>Email address, phone number, and alternative contact details</li>
                  <li>Corporate Affairs Commission (CAC) registration number and business type (for businesses)</li>
                  <li>Tax Identification Number (TIN) for business verification</li>
                  <li>Government-issued identification documents (international passport, driver's licence, or voter's card) for identity verification</li>
                  <li>Business category, description, and operating details</li>
                  <li>Physical address and geographical location</li>
                  <li>Profile photographs and business logos</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.2 Billing and Subscription Data</h3>
                <p className="text-muted-foreground mb-2">For verification fee and subscription billing, we collect or process:</p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>Verification fee payment records and subscription billing history</li>
                  <li>Payment method metadata (card type, issuing bank — note: full card numbers are never stored by Naitrust)</li>
                  <li>Billing dates, amounts, and subscription status</li>
                </ul>
                <p className="text-muted-foreground mt-2 text-sm">
                  Payment card details are processed exclusively by Paystack, our PCI-DSS Level 1 certified payment partner. 
                  Naitrust does not store, transmit, or have access to full payment card numbers. Payments connected to property transactions are processed by the regulated financial partner identified for that transaction. If you enable auto-renewal, your card details are 
                  securely stored and managed by Paystack for recurring charges — Naitrust only stores a tokenized reference 
                  and never has access to your full card number, CVV, or PIN.
                </p>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.3 Property Transaction Data</h3>
                <p className="text-muted-foreground mb-2">When property transaction features become available, we may process:</p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>Property descriptions, locations, transaction purposes, amounts, and timelines</li>
                  <li>Participant identities, contact details, claimed roles, and transaction permissions</li>
                  <li>Agreements, offers, receipts, payment status, milestones, messages, and confirmations</li>
                  <li>Property documents, inspection evidence, photographs, issue reports, and supporting files submitted by participants</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">Naitrust does not independently certify property ownership, title validity, authority to sell, or the legal effect of documents merely because they are uploaded to a transaction record.</p>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.3 Technical and Usage Data</h3>
                <p className="text-muted-foreground mb-2">We automatically collect:</p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>IP address, device type, browser type, and operating system</li>
                  <li>Pages visited, features accessed, and session duration</li>
                  <li>Search queries and interaction history on the Platform</li>
                  <li>Referral source and browsing patterns</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.4 Communications Data</h3>
                <p className="text-muted-foreground">
                  Messages exchanged between users through the Platform's in-app messaging system, customer support 
                  correspondence, feedback submissions, and fraud reports. Communications data is stored to facilitate 
                  dispute resolution, fraud investigation, and service improvement.
                </p>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.5 Verification and Compliance Data</h3>
                <p className="text-muted-foreground mb-2">For fraud prevention and regulatory compliance:</p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>Government-issued ID documents, NIN or BVN details where applicable, and proof of address</li>
                  <li>CAC registration certificates and related corporate documents</li>
                  <li>Tax Identification Number (TIN)</li>
                  <li>Business premises photographs</li>
                  <li>Verification audit trail and compliance screening results</li>
                  <li>CAC verification results (processed via QoreId, a NITDA-compliant provider)</li>
                  <li>TIN validation results (processed via QoreId)</li>
                  <li>Individual identity, facial match, and liveness-check results processed by approved verification providers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.6 Biometric and Camera Data</h3>
                <p className="text-muted-foreground mb-2">
                  During individual or business verification, your device camera may be accessed to capture a live selfie, perform a liveness check, compare your face with an identity record, or capture a photo of you 
                  holding your government-issued identification document. Images, facial templates, liveness signals, and match results may constitute biometric and sensitive personal data, 
                  classified as sensitive personal data under Section 30 of the NDPA 2023.
                </p>
                <p className="text-muted-foreground">
                  We request camera access only when you start a check. Liveness technology is used to help determine that a real person is present and to reduce impersonation and replay fraud. A successful check confirms only that the submitted data passed the checks performed; it is not a guarantee of character, solvency, or future conduct.
                </p>
              </div>

              <div>
                <h3 className="text-lg mb-2">2.7 Verification Documents</h3>
                <p className="text-muted-foreground mb-2">
                  During the verification process, we collect and process the following document types:
                </p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>Live selfie photograph (captured via device camera)</li>
                  <li>Selfie photograph holding a personal identification document (captured via device camera)</li>
                  <li>CAC certificate images or PDF documents</li>
                  <li>Personal identification documents (NIN slip, International Passport)</li>
                  <li>Optional supporting documents as requested or voluntarily provided</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Legal Basis and Purpose */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">3. Legal Basis and Purpose of Processing</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-4">
                In accordance with Section 25 of the NDPA 2023 and Article 2.2 of the NDPR 2019, we process your 
                personal data on the following lawful bases:
              </p>
              <ul className="list-disc ml-6 text-muted-foreground space-y-2">
                <li><strong>Consent:</strong> You have given clear consent for processing your personal data for specific purposes, including verification and identity checks</li>
                <li><strong>Contractual Necessity:</strong> Processing is necessary for the performance of the contract between you and Naitrust (i.e., providing our verification and platform services)</li>
                <li><strong>Legal Obligation:</strong> Processing is required to comply with Nigerian law, including AML/CFT regulations, tax reporting obligations, and CBN directives</li>
                <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate interests in fraud prevention, platform security, service improvement, and business analytics, provided such interests do not override your fundamental rights and freedoms</li>
              </ul>
              
              <h3 className="text-lg mt-4 mb-2">Specific purposes include:</h3>
              <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li>Verifying individuals and business representatives through identity, facial-match, and liveness checks</li>
                  <li>Verifying business identity and registration through CAC, TIN, ownership, and representative checks</li>
                <li>Creating and maintaining user accounts and NT IDs</li>
                <li>Processing verification fee payments and subscription billing</li>
                <li>Facilitating communications between customers and businesses</li>
                <li>Detecting, preventing, and investigating fraud and unauthorised activities</li>
                <li>Displaying business profiles and verification badges</li>
                <li>Sending transactional notifications, security alerts, and service updates</li>
                <li>Training and improving our AI fraud detection systems</li>
                <li>Complying with legal, regulatory, and judicial obligations</li>
                <li>Providing customer support and resolving disputes</li>
                <li>Generating anonymised analytics for service improvement</li>
              </ul>

              <h3 className="text-lg mt-6 mb-2">Verification Paths</h3>
              <p className="text-muted-foreground mb-2">
                Naitrust offers two verification paths, each involving different data processing activities:
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-2">
                  <h4 className="font-semibold mb-1">Instant Verification</h4>
                  <p className="text-muted-foreground text-sm">
                    Automated CAC registration verification, NIN or International Passport verification via the QoreID API, 
                    identity matching against CAC-registered affiliates, and business email OTP verification. This path is 
                    fully automated with no human review of your documents.
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2">
                  <h4 className="font-semibold mb-1">Manual Verification</h4>
                  <p className="text-muted-foreground text-sm">
                    You upload a live selfie (captured via device camera), a selfie holding your ID (captured via device camera), 
                    your CAC certificate, a personal identification document, and optional supporting documents. These materials 
                    are reviewed by authorised Naitrust administrative staff. Manual verification is typically completed within 
                    1–3 business days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">4. Disclosure of Personal Data</h2>
            </div>
            
            <div className="ml-8 space-y-4">
              <div>
                <h3 className="text-lg mb-2">4.1 Publicly Visible Information</h3>
                <p className="text-muted-foreground">
                  Business profiles — including business name, category, description, location, verification status, 
                  reviews, and ratings — are publicly visible on the Platform and through shareable profile links. 
                  Customer names may be visible on reviews they post. No sensitive personal data (financial 
                  records, identification documents, or TIN) is ever publicly displayed.
                </p>
              </div>

              <div>
                <h3 className="text-lg mb-2">4.2 Authorised Third-Party Service Providers</h3>
                <p className="text-muted-foreground mb-2">
                  We share personal data with the following categories of processors, all of whom are contractually 
                  bound to process data only on our instructions and in compliance with applicable data protection law:
                </p>
                <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                  <li><strong>Payment and Banking Partners:</strong> Regulated providers used for subscriptions and, when launched, property-transaction funding, settlement, release, refund, and status updates</li>
                  <li><strong>Verification Providers:</strong> QoreID for CAC, TIN, and personal ID validation against government databases</li>
                  <li><strong>Cloud Infrastructure:</strong> Hosting and data storage providers with ISO 27001 or equivalent certification</li>
                  <li><strong>Communication Services:</strong> Email and SMS service providers for transactional notifications</li>
                  <li><strong>Analytics Providers:</strong> For anonymised usage analytics and performance monitoring</li>
                  <li><strong>Image Storage:</strong> ImageKit — a cloud-based image storage and delivery service used to store verification document images (selfies, ID photos, CAC certificates). Data stored via ImageKit may reside on servers outside Nigeria and is subject to a Data Processing Agreement (DPA) with Naitrust ensuring compliance with applicable data protection standards</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-2">4.3 Legal and Regulatory Disclosure</h3>
                <p className="text-muted-foreground">
                  We may disclose personal data where required by Nigerian law, regulation, court order, or governmental 
                  directive. This includes cooperation with the Nigeria Police Force, Economic and Financial Crimes Commission 
                  (EFCC), Independent Corrupt Practices Commission (ICPC), Central Bank of Nigeria, NITDA, or any other 
                  competent authority in the investigation of fraud, money laundering, or cybercrime.
                </p>
              </div>

              <div>
                <h3 className="text-lg mb-2">4.4 Business Transfers</h3>
                <p className="text-muted-foreground">
                  In the event of a merger, acquisition, reorganisation, or sale of all or substantially all of Naitrust's 
                  assets, your personal data may be transferred to the successor entity. You will be notified of any such 
                  transfer and your continued rights under this Policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg mb-2">4.5 International Data Transfers</h3>
                <p className="text-muted-foreground">
                  Where personal data is transferred to processors located outside Nigeria, we ensure that adequate 
                  safeguards are in place as required by the NDPA 2023 and NDPR 2019, including execution of standard 
                  contractual clauses and verification that the recipient jurisdiction provides an adequate level of 
                  data protection.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">5. Data Security Measures</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-2">
                We implement appropriate technical and organisational measures to protect personal data against 
                unauthorised access, alteration, disclosure, or destruction, including:
              </p>
              <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                <li>TLS 1.3 encryption for all data in transit</li>
                <li>AES-256 encryption for sensitive data at rest</li>
                <li>Regular vulnerability assessments and penetration testing</li>
                <li>Role-based access controls with principle of least privilege</li>
                <li>Multi-factor authentication for administrative access</li>
                <li>AI-powered anomaly detection and real-time security monitoring</li>
                <li>Secure verification fee processing through PCI-DSS Level 1 certified payment partner</li>
                <li>Automated backups with encrypted offsite storage</li>
                <li>Incident response procedures and breach notification protocols</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Notwithstanding the above, no system of electronic data transmission or storage is entirely secure. While 
                we employ commercially reasonable measures to protect your data, we cannot guarantee absolute security. 
                In the event of a data breach affecting your personal data, we shall notify you and the relevant regulatory 
                authorities in accordance with the NDPA 2023.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">6. Your Data Protection Rights</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-2">
                Under the NDPA 2023 and NDPR 2019, you have the following rights with respect to your personal data:
              </p>
              <ul className="list-disc ml-6 text-muted-foreground space-y-2">
                <li><strong>Right of Access:</strong> You may request a copy of the personal data we hold about you, together with information about the purposes of processing and the categories of recipients</li>
                <li><strong>Right to Rectification:</strong> You may request correction of inaccurate or incomplete personal data</li>
                <li><strong>Right to Erasure:</strong> You may request deletion of your personal data, subject to our legal retention obligations (see Section 7)</li>
                <li><strong>Right to Data Portability:</strong> You may request your personal data in a structured, commonly used, and machine-readable format</li>
                <li><strong>Right to Object:</strong> You may object to processing based on legitimate interests where your particular circumstances warrant</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw that consent at any time without affecting the lawfulness of processing carried out prior to withdrawal</li>
                <li><strong>Right to Restrict Processing:</strong> You may request restriction of processing in certain circumstances, such as where you contest the accuracy of data</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise any of these rights, contact our Data Protection Officer at <strong>dpo@naitrust.com</strong>. 
                We shall respond to valid requests within thirty (30) calendar days. We may request additional information 
                to verify your identity before processing the request.
              </p>

              <h3 className="text-lg mt-6 mb-2">6.1 Consent Mechanisms</h3>
              <p className="text-muted-foreground mb-2">
                Naitrust implements the following consent mechanisms to ensure your data is processed transparently and lawfully:
              </p>
              <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                <li><strong>Camera Access:</strong> Before accessing your device camera for selfie capture, you are prompted with a standard browser permission dialog. Camera access is only used during the manual verification process and is not retained beyond the capture session.</li>
                <li><strong>Document Review Consent:</strong> Before submitting verification documents, you are informed that your documents will be reviewed by authorised Naitrust administrative staff, and you provide consent to proceed.</li>
                <li><strong>Third-Party Data Sharing:</strong> Before instant verification via QoreID, you consent to sharing your identification data (NIN, International Passport, or CAC details) with QoreID for verification against government databases.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                All consent is freely given, specific, informed, and unambiguous as required by the NDPA 2023. You may withdraw 
                your consent at any time by contacting our Data Protection Officer, though withdrawal of consent may prevent the 
                completion of verification and limit your access to certain Platform features.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">7. Data Retention</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-2">We retain personal data for the following periods:</p>
              <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                <li><strong>Account data:</strong> For the duration of your active account, plus 12 months following account deletion</li>
                <li><strong>Verification fee and billing records:</strong> Seven (7) years from the date of the transaction, as required by Nigerian financial regulations and the Federal Inland Revenue Service</li>
                <li><strong>Verification documents:</strong> Five (5) years from the date of verification or account closure, whichever is later</li>
                <li><strong>Communications data:</strong> Three (3) years from the date of the communication</li>
                <li><strong>Technical/usage data:</strong> Twenty-four (24) months from the date of collection</li>
                <li><strong>Fraud reports and investigation records:</strong> Seven (7) years or such longer period as required by ongoing legal proceedings</li>
                <li><strong>Selfie and ID photos (manual verification):</strong> Deleted from ImageKit within thirty (30) days of verification approval or rejection. Selfie-with-ID photos are deleted immediately after administrative review is complete to minimise biometric data retention</li>
                <li><strong>Verification documents (CAC certificates, ID documents):</strong> Retained for up to five (5) years from the date of verification for regulatory compliance purposes</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Upon expiry of the applicable retention period, personal data shall be securely deleted or irreversibly 
                anonymised. Where data is required for ongoing legal proceedings, regulatory investigations, or dispute 
                resolution, retention may be extended for the duration of such proceedings.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">8. Children and Minors</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground">
                The Platform is not intended for use by individuals under the age of eighteen (18) years. We do not 
                knowingly collect or process personal data from minors. If we become aware that we have collected personal 
                data from a minor, we shall take immediate steps to delete such data. If you believe that a minor has 
                provided personal data to us, please contact our Data Protection Officer at dpo@naitrust.com immediately.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">9. Cookies and Tracking Technologies</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-2">
                The Platform uses cookies and similar tracking technologies to enhance your experience. We use:
              </p>
              <ul className="list-disc ml-6 text-muted-foreground space-y-1">
                <li><strong>Essential Cookies:</strong> Required for Platform functionality, authentication, and security (cannot be disabled)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform to improve our services</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                You may manage your cookie preferences through the "Cookie Preferences" option in the Platform footer. 
                Disabling non-essential cookies may affect certain Platform features.
              </p>
            </div>
          </section>

          {/* Third-Party Verification */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">10. Third-Party Verification Services</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-4">
                For business verification (including CAC, TIN, and personal ID validation), we engage QoreId, a licensed and 
                NITDA-compliant third-party identity verification provider. Naitrust has executed a formal Data Processing 
                Agreement (DPA) with QoreId, which governs the processing of personal data on our behalf in accordance 
                with the NDPA 2023 and NDPR 2019.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1E90FF]" />
                  QoreId Integration
                </h3>
                <ul className="list-disc ml-6 text-gray-700 space-y-1 text-sm">
                  <li>QoreId verifies CAC registration details by querying official government databases</li>
                  <li>QoreId validates TIN and personal ID documents against government records</li>
                  <li>Only the minimum data necessary for verification (CAC number, TIN, personal ID details, business name) is shared with QoreId</li>
                  <li>QoreId maintains compliance with NDPR/NDPA and applicable data protection standards</li>
                  <li>A formal Data Processing Agreement (DPA) is in place governing QoreId's handling of personal data</li>
                  <li>All data transmissions to and from QoreId are encrypted using TLS</li>
                  <li>Verification results and timestamps are recorded in your verification audit trail</li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                Learn more about QoreId's data protection practices at{' '}
                <a href="https://qoreid.com" target="_blank" rel="noopener noreferrer" className="text-[#1E90FF] hover:underline">
                  qoreid.com
                </a>
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">11. Amendments to This Policy</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal 
                requirements, or other factors. Material changes will be notified to you via email and/or prominent Platform 
                notification at least fourteen (14) calendar days before taking effect. The "Last Updated" date at the top 
                of this Policy indicates the most recent revision. Your continued use of the Platform following any amendment 
                constitutes acceptance of the updated Policy.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">12. Governing Law, Complaints, and Dispute Resolution</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-4">
                This Privacy Policy is governed by and construed in accordance with the laws of the Federal Republic of 
                Nigeria, including the Nigeria Data Protection Act (NDPA) 2023, the Nigeria Data Protection Regulation 
                (NDPR) 2019, and the Cybercrimes (Prohibition, Prevention, etc.) Act 2015.
              </p>
              <p className="text-muted-foreground mb-4">
                If you believe that your data protection rights have been infringed, you may:
              </p>
              <ol className="list-decimal ml-6 text-muted-foreground space-y-1">
                <li>Contact our Data Protection Officer at dpo@naitrust.com</li>
                <li>File a complaint with the Nigeria Data Protection Commission (NDPC)</li>
                <li>Seek redress through the dispute resolution mechanisms set out in our Terms of Service</li>
                <li>Pursue legal remedies before a court of competent jurisdiction in Nigeria</li>
              </ol>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-6 h-6 text-[#1E90FF]" />
              <h2 className="text-xl">13. Contact Us</h2>
            </div>
            
            <div className="ml-8">
              <p className="text-muted-foreground mb-4">
                For questions, concerns, or requests relating to this Privacy Policy or our data practices:
              </p>
              <div className="p-4 rounded-lg space-y-2 border-2">
                <p><strong>Data Protection Officer:</strong> dpo@naitrust.com</p>
                <p><strong>Privacy Enquiries:</strong> dpo@naitrust.com</p>
                <p><strong>General Support:</strong> contact@naitrust.com</p>
                <p><strong>Registered Address:</strong> Lagos, Nigeria</p>
              </div>
            </div>
          </section>

          {/* CTA Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('terms')}
              className="px-6 py-3 bg-white border-2 border-[#1E90FF] text-[#1E90FF] rounded-full hover:bg-primary/5 transition-colors"
            >
              Read Terms of Service
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 bg-[#1E90FF] text-white rounded-full hover:shadow-lg transition-shadow"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
