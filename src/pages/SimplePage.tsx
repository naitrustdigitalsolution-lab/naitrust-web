interface SimplePageProps {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
}

function SimplePage({ eyebrow, title, description, points }: SimplePageProps) {
  return (
    <main className="page-shell">
      <section className="simple-page">
        <div className="simple-page-content">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
          <div className="simple-grid">
            {points.map((point) => (
              <article key={point}>
                <h3>{point}</h3>
                <p>Naitrust will expand this section as the product build progresses.</p>
              </article>
            ))}
          </div>
          <a className="button button-primary" href="/">
            Back home
          </a>
        </div>
      </section>
    </main>
  );
}

export default SimplePage;
