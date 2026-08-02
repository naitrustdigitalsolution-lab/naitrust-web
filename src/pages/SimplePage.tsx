interface SimplePageProps {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
}

function SimplePage({ eyebrow, title, description, points }: SimplePageProps) {
  const location = useLocation();

  return (
    <main className="page-shell">
      <SEOHead title={title} description={description} canonicalPath={location.pathname} />
      <section className="simple-page">
        <div className="simple-page-content">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
          <div className="simple-grid">
            {points.map((point) => (
              <article key={point}>
                <h3>{point}</h3>
                <p>Built into the Naitrust experience for clearer, more confident payments and transactions.</p>
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
import { useLocation } from 'react-router-dom';
import { SEOHead } from '../components/utility/SEOHead';
