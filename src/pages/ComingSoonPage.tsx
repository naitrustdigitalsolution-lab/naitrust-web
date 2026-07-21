import { createElement, useMemo, useState } from "react";
import { appConfig } from "../configs/env";
import { joinWaitlist } from "../services/publicService";
import type { WaitlistPayload } from '../types/global';

const initialFormState = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  phone: "",
  userType: "",
  transactionRange: "",
  transactionNeed: "",
  consent: false,
};

type FormState = typeof initialFormState;

function buildPayload(formState: FormState): WaitlistPayload {
  return {
    fullName: `${formState.firstName} ${formState.lastName}`.trim(),
    businessName: formState.businessName,
    email: formState.email,
    phone: formState.phone,
    transactionNeed: formState.transactionNeed,
    consent: formState.consent,
    userType: formState.userType as WaitlistPayload["userType"],
    transactionRange: formState.transactionRange as WaitlistPayload["transactionRange"],
    source: `naitrust-web-${appConfig.mode}`,
    submittedAt: new Date().toISOString(),
  };
}

function isValid(formState: FormState) {
  return Boolean(
    formState.firstName &&
      formState.lastName &&
      formState.email &&
      formState.phone &&
      formState.userType &&
      formState.transactionRange &&
      formState.consent,
  );
}

function ComingSoonPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modeLabel = useMemo(() => appConfig.mode.toUpperCase(), []);

  function updateField(field: keyof FormState, value: string | boolean) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsError(false);

    if (!isValid(formState)) {
      setStatus("Please complete all required fields.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await joinWaitlist(buildPayload(formState));
      setFormState(initialFormState);
      setStatus("You are on the list. We will contact you when early access opens.");
      setIsError(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We could not submit this right now.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav" aria-label="Primary">
          <a className="brand" href="/" aria-label="Naitrust home">
            <span className="brand-mark">N</span>
            <span>Naitrust</span>
          </a>
          <div className="nav-actions">
            <a className="nav-link" href="#platform">
              Platform
            </a>
            <a className="nav-link nav-link-strong" href="#waitlist">
              Join waitlist
            </a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Coming soon for Nigerian real estate</p>
            <h1 id="hero-title">Buy property with greater confidence.</h1>
            <p className="lede">
              Naitrust is building one trusted platform for property buyers, sellers, agents,
              developers, and real estate companies to record participants, agreements, payments,
              documents, milestones, and supporting evidence.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#waitlist">
                Join the waiting list
              </a>
              <a className="button button-secondary" href="#how-it-works">
                How it works
              </a>
            </div>

            <dl className="trust-stats" aria-label="Naitrust launch focus">
              <div>
                <dt>Property transactions</dt>
                <dd>Create agreement-backed transactions</dd>
              </div>
              <div>
                <dt>Real estate first</dt>
                <dd>For buyers, sellers, agents, developers, and companies</dd>
              </div>
              <div>
                <dt>{modeLabel}</dt>
                <dd>Frontend mode controlled by environment</dd>
              </div>
            </dl>
          </div>

          <aside className="world-panel" aria-label="Naitrust connected trust visual">
            <div className="spline-stage">
              {appConfig.splineSceneUrl
                ? createElement("spline-viewer", {
                    className: "spline-viewer is-ready",
                    "loading-anim-type": "spinner-small-dark",
                    url: appConfig.splineSceneUrl,
                    "aria-hidden": "true",
                  })
                : null}
              <div className="world-animation" aria-hidden="true">
                <div className="world-orbit orbit-one" />
                <div className="world-orbit orbit-two" />
                <div className="world-core">
                  <span className="node node-lagos" />
                  <span className="node node-abuja" />
                  <span className="node node-kano" />
                  <span className="node node-port" />
                </div>
                <div className="signal signal-one" />
                <div className="signal signal-two" />
                <div className="signal signal-three" />
              </div>
            </div>
            <div className="visual-caption">
              <strong>Trust infrastructure for Nigerian real estate</strong>
              <span>Participant records, agreements, payments, property documents, milestones, and evidence.</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="platform-section" id="platform" aria-labelledby="platform-title">
        <div className="section-heading">
          <p className="eyebrow">What Naitrust is building</p>
          <h2 id="platform-title">A clear record for property transactions that need more than trust.</h2>
          <p>
            Property transactions often happen through WhatsApp chats, screenshots, verbal promises,
            bank transfers, and scattered documents. Naitrust brings the important parts into one
            workflow so participants can see who is involved, what was agreed, what was paid, which
            documents were supplied, and what happens next.
          </p>
        </div>
        <div className="platform-grid">
          <article>
            <h3>For property buyers</h3>
            <p>Keep the property, seller, agent, developer, terms, payments, and supporting records visible.</p>
          </article>
          <article>
            <h3>For property companies</h3>
            <p>Give buyers a professional record of agreements, instalments, documents, milestones, and confirmations.</p>
          </article>
          <article>
            <h3>For agents and developers</h3>
            <p>Document roles, authority, property commitments, payment stages, evidence, and completion activity.</p>
          </article>
        </div>
      </section>

      <section className="workflow" id="how-it-works" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="eyebrow">Built around the property transaction</p>
          <h2 id="workflow-title">From participant records to documented completion.</h2>
        </div>
        <div className="workflow-grid">
          <article>
            <span>01</span>
            <h3>Create a property transaction</h3>
            <p>Record the property, participants, amount, payment plan, milestones, documents, and required evidence.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Verify the parties</h3>
            <p>Use individual, business, document, and liveness checks based on risk level.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Protect the payment</h3>
            <p>Route funding, hold, release, and refunds through approved financial partners.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Complete with evidence</h3>
            <p>Track proof, resolve issues, and turn successful transactions into reputation.</p>
          </article>
        </div>
      </section>

      <section className="details-section" aria-labelledby="details-title">
        <div className="section-heading">
          <p className="eyebrow">Who should join</p>
          <h2 id="details-title">Built first for Nigerian property transactions where uncertainty is expensive.</h2>
        </div>
        <div className="details-grid">
          <article className="deal-panel">
            <div className="deal-header">
              <span>Example transaction room</span>
              <strong>Property reservation</strong>
            </div>
            <ol className="deal-steps">
              <li className="complete"><span /> Parties invited</li>
              <li className="complete"><span /> Verification checked</li>
              <li className="complete"><span /> Terms agreed</li>
              <li className="active"><span /> Payment protected</li>
              <li><span /> Property documents reviewed</li>
              <li><span /> Completion or issue recorded</li>
            </ol>
            <div className="provider-row">
              <p>Payment provider strategy</p>
              <div>
                <span>Anchor</span>
                <span>Providus Bank</span>
              </div>
            </div>
          </article>
          <div className="use-case-list">
            <article>
              <h3>Property buyers and sellers</h3>
              <p>Land purchases, property deposits, sales agreements, inspections, payment evidence, and completion records.</p>
            </article>
            <article>
              <h3>Agents and property companies</h3>
              <p>Participant roles, authority records, buyer commitments, developer instalments, and supporting documents.</p>
            </article>
            <article>
              <h3>Diaspora buyers and representatives</h3>
              <p>Remote property transactions with one accessible history of local participants, payments, inspections, and progress.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist" aria-labelledby="waitlist-title">
        <div className="waitlist-copy">
          <p className="eyebrow">Early access</p>
          <h2 id="waitlist-title">Join the waiting list.</h2>
          <p>
            Tell us who you are and the kind of property transaction you want Naitrust to support. We
            will use this to invite the right early users first.
          </p>
          <ul className="waitlist-benefits">
            <li>Get early product updates.</li>
            <li>Help shape the first property transaction workflow.</li>
            <li>Be considered for pilot access when testing opens.</li>
          </ul>
        </div>

        <form className="waitlist-form" name="naitrust-waitlist" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="name"
              value={formState.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={formState.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
          </div>
          <div className="form-row">
            <label htmlFor="businessName">Business or company name</label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              autoComplete="organization"
              value={formState.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formState.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="userType">I am joining as</label>
            <select
              id="userType"
              name="userType"
              value={formState.userType}
              onChange={(event) => updateField("userType", event.target.value)}
              required
            >
              <option value="">Select one</option>
              <option value="property_buyer">Property buyer</option>
              <option value="property_seller">Property seller or owner</option>
              <option value="real_estate_agent">Real estate agent</option>
              <option value="real_estate_company">Real estate company</option>
              <option value="property_developer">Property developer</option>
              <option value="legal_transaction_representative">Legal or transaction representative</option>
              <option value="partner">Payment, verification, or technology partner</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="transactionRange">Typical transaction size</label>
            <select
              id="transactionRange"
              name="transactionRange"
              value={formState.transactionRange}
              onChange={(event) => updateField("transactionRange", event.target.value)}
              required
            >
              <option value="">Select range</option>
              <option value="below_100k">Below NGN 100k</option>
              <option value="100k_500k">NGN 100k - 500k</option>
              <option value="500k_5m">NGN 500k - 5m</option>
              <option value="5m_50m">NGN 5m - 50m</option>
              <option value="above_50m">Above NGN 50m</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="transactionNeed">Which property transaction do you need help recording?</label>
            <textarea
              id="transactionNeed"
              name="transactionNeed"
              rows={4}
              placeholder="Example: I am paying a reservation deposit for a property from a developer."
              value={formState.transactionNeed}
              onChange={(event) => updateField("transactionNeed", event.target.value)}
            />
          </div>
          <label className="consent-row" htmlFor="consent">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={formState.consent}
              onChange={(event) => updateField("consent", event.target.checked)}
              required
            />
            <span>I agree to be contacted about Naitrust early access and product updates.</span>
          </label>
          <button className="button button-primary form-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request early access"}
          </button>
          <p className={`form-status ${isError ? "error" : ""}`} role="status" aria-live="polite">
            {status}
          </p>
        </form>
      </section>

      <footer className="footer">
        <p>Naitrust Digital Solution. Funds are handled by regulated financial partners.</p>
      </footer>
    </main>
  );
}

export default ComingSoonPage;
