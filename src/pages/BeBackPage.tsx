function BeBackPage() {
  return (
    <main className="page-shell">
      <section className="hero status-hero" aria-labelledby="status-title">
        <nav className="nav" aria-label="Primary">
          <a className="brand" href="/" aria-label="Naitrust home">
            <span className="brand-mark">N</span>
            <span>Naitrust</span>
          </a>
        </nav>

        <div className="status-panel">
          <p className="eyebrow">Service status</p>
          <h1 id="status-title">We will be back shortly.</h1>
          <p className="lede">
            Naitrust is temporarily unavailable while we update the trusted transaction platform.
            Please check back soon.
          </p>
        </div>
      </section>
    </main>
  );
}

export default BeBackPage;
