import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "../utility/SEOHead";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { blogArticles } from "../../mocks/screens/blog";

export function BlogPage() {
  const [query, setQuery] = useState("");
  const articles = useMemo(
    () =>
      blogArticles.filter((article) =>
        `${article.title} ${article.category} ${article.summary}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const featured = blogArticles[0];
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Naitrust Blog"
        description="Practical guides about safer Nigerian transactions, verification, evidence and trust."
        canonicalPath="/blog"
      />
      <section className="bg-[#031335] dark:bg-[#0A0E1A] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Badge className="mb-5 bg-white/10 text-white hover:bg-white/10">
            Naitrust Insights
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">
            Practical thinking for safer deals
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Useful guides for buyers and honest businesses navigating identity,
            agreements, payments and evidence.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to={`/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:shadow-xl lg:grid-cols-[1.2fr_1fr]"
        >
          <img
            src={featured.image}
            alt={featured.imageAlt}
            className="h-full min-h-72 w-full object-cover"
          />
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <Badge variant="outline" className="w-fit">
              Featured · {featured.category}
            </Badge>
            <h2 className="mt-5 text-3xl font-bold leading-tight">
              {featured.title}
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {featured.summary}
            </p>
            <span className="mt-7 inline-flex items-center gap-2 font-semibold text-primary">
              Read article{" "}
              <ArrowRight
                className="transition group-hover:translate-x-1"
                size={18}
              />
            </span>
          </div>
        </Link>
        <div className="mt-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-primary">All articles</p>
            <h2 className="mt-2 text-3xl font-bold">
              Learn before the next deal
            </h2>
          </div>
          <label className="relative block sm:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles"
              className="pl-11"
            />
          </label>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <img
                src={article.image}
                alt={article.imageAlt}
                className="h-52 w-full object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-primary">
                    {article.category}
                  </span>
                  <span className="text-muted-foreground">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold leading-snug">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {article.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read more <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        {articles.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            No articles match your search.
          </p>
        )}
      </main>
    </div>
  );
}
