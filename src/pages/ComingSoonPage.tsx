import { createElement, useMemo, useState } from "react";
import { appConfig } from "../configs/env";
import { submitWaitlist } from "../services/waitlistService";
import type { WaitlistPayload } from '../types/global';

const initialFormState = {
  fullName: "",
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
    ...formState,
    userType: formState.userType as WaitlistPayload["userType"],
    transactionRange: formState.transactionRange as WaitlistPayload["transactionRange"],
    source: `naitrust-web-${appConfig.mode}`,
    submittedAt: new Date().toISOString(),
  };
}

function isValid(formState: FormState) {
  return Boolean(
    formState.fullName &&
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
      const result = await submitWaitlist(buildPayload(formState));
      setFormState(initialFormState);
      setStatus(
        result.mode === "mock"
          ? "Mock mode: your waitlist request was saved locally for frontend testing."
          : "You are on the list. We will contact you when early access opens.",
      );
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
            <p className="eyebrow">Coming soon for trusted commerce</p>
            <h1 id="hero-title">When the transaction matters, use Naitrust.</h1>
            <p className="lede">
              Naitrust is building a safer way for Nigerians to buy, sell, hire, deliver, and
              get paid when both parties do not fully know each other yet.
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
                <dt>Safe deals</dt>
                <dd>Create agreement-backed transactions</dd>
              </div>
              <div>
                <dt>B2B + B2C</dt>
                <dd>Built for business and high-risk consumer trades</dd>
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
              <strong>Trust layer for Nigerian transactions</strong>
              <span>Verification, agreements, protected payments, evidence, and release workflow.</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="platform-section" id="platform" aria-labelledby="platform-title">
        <div className="section-heading">
          <p className="eyebrow">What Naitrust is building</p>
          <h2 id="platform-title">A transaction room for deals that need more than trust.</h2>
          <p>
            Today, many deals happen through WhatsApp chats, screenshots, verbal promises,
            PDF invoices, bank transfers, and scattered evidence. Naitrust brings the important
            parts into one workflow so both sides know who they are dealing with, what was
            agreed, where the payment is, and what happens next.
          </p>
        </div>
        <div className="platform-grid">
          <article>
            <h3>For buyers</h3>
            <p>Reduce the fear of paying a supplier, vendor, agent, or contractor who may disappear.</p>
          </article>
          <article>
            <h3>For sellers</h3>
            <p>Show seriousness, collect protected payments, submit evidence, and build reputation.</p>
          </article>
          <article>
            <h3>For partners</h3>
            <p>Connect regulated payment, banking, verification, logistics, and marketplace services.</p>
          </article>
        </div>
      </section>

      <section className="workflow" id="how-it-works" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="eyebrow">Built around the deal</p>
          <h2 id="workflow-title">From agreement to payment release.</h2>
        </div>
        <div className="workflow-grid">
          <article>
            <span>01</span>
            <h3>Create a safe deal</h3>
            <p>Set the amount, parties, delivery terms, timeline, and required evidence.</p>
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
          <h2 id="details-title">Built first for Nigerian transactions where failure is expensive.</h2>
        </div>
        <div className="details-grid">
          <article className="deal-panel">
            <div className="deal-header">
              <span>Example transaction room</span>
              <strong>Supplier order</strong>
            </div>
            <ol className="deal-steps">
              <li className="complete"><span /> Parties invited</li>
              <li className="complete"><span /> Verification checked</li>
              <li className="complete"><span /> Terms agreed</li>
              <li className="active"><span /> Payment protected</li>
              <li><span /> Delivery evidence</li>
              <li><span /> Release or dispute</li>
            </ol>
            <div className="provider-row">
              <p>Payment provider strategy</p>
              <div>
                <span>Kora</span>
                <span>Providus Bank</span>
              </div>
            </div>
          </article>
          <div className="use-case-list">
            <article>
              <h3>SMEs and wholesalers</h3>
              <p>Bulk orders, supplier payments, stock purchases, distribution deals, and contractor payments.</p>
            </article>
            <article>
              <h3>Service providers</h3>
              <p>Freelancers, agencies, event vendors, construction teams, and professionals who need payment confidence.</p>
            </article>
            <article>
              <h3>High-risk B2C trades</h3>
              <p>Phones, laptops, property deposits, fashion orders, social-commerce purchases, and informal seller deals.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist" aria-labelledby="waitlist-title">
        <div className="waitlist-copy">
          <p className="eyebrow">Early access</p>
          <h2 id="waitlist-title">Join the waiting list.</h2>
          <p>
            Tell us who you are and the kind of transaction you want Naitrust to protect. We
            will use this to invite the right early users first.
          </p>
          <ul className="waitlist-benefits">
            <li>Get early product updates.</li>
            <li>Help shape the first safe-deal workflow.</li>
            <li>Be considered for pilot access when testing opens.</li>
          </ul>
        </div>

        <form className="waitlist-form" name="naitrust-waitlist" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={formState.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="businessName">Business or brand name</label>
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
              <option value="business_buyer">Business buyer</option>
              <option value="supplier_vendor">Supplier or vendor</option>
              <option value="contractor_service_provider">Contractor or service provider</option>
              <option value="marketplace_social_seller">Marketplace or social seller</option>
              <option value="partner">Potential partner</option>
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
            <label htmlFor="transactionNeed">What transaction do you want to protect?</label>
            <textarea
              id="transactionNeed"
              name="transactionNeed"
              rows={4}
              placeholder="Example: I buy goods from suppliers I do not fully know."
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
