import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SEOHead } from "../utility/SEOHead";
import { Badge } from "../ui/badge";
import { useCases } from "../../libs/use-cases";

const cardThemes: Record<string, { comingLater?: boolean }> = {
  'vehicle-transactions': { comingLater: true },
  'high-value-personal-purchases': { comingLater: true },
};

export function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Naitrust for Nigerian Real Estate"
        description="Explore how Naitrust is being designed to create clearer records for Nigerian property purchases, deposits, instalments, agents, documents, and construction milestones."
        canonicalPath="/use-cases"
      />
      <section className="bg-[#031335] dark:bg-[#0A0E1A] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Badge className="mb-5 bg-white/10 text-white hover:bg-white/10">
            Real estate first
          </Badge>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Trust Infrastructure for Nigerian Real Estate
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Naitrust is the trust layer underneath every Nigerian property deal — verifying
            who's involved, documenting agreed terms, protecting payments, and keeping
            evidence in one record. It does not list or sell properties.
          </p>
          <p className="mt-5 text-sm font-medium text-blue-300">
            Coming soon · Join the waiting list for launch updates
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-0 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map(
            ({ slug, icon: Icon, title, audience, summary }, index) => {
              const theme = cardThemes[slug] ?? {};
              return (
              <motion.article
                key={slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.05 }}
                className={`group relative flex min-h-80 flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${theme.comingLater ? 'opacity-80' : ''}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-400 to-slate-500`} />
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300`}>
                    <Icon size={24} />
                  </div>
                  {theme.comingLater && (
                    <span className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                      Coming later
                    </span>
                  )}
                </div>
                <p className={`mt-5 w-fit rounded-full px-3 py-1.5 text-xs font-bold leading-5 bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300`}>
                  {audience}
                </p>
                <h2 className="mt-2 text-xl font-bold">{title.replace(/\s*—\s*coming later$/i, '')}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {summary}
                </p>
                <Link
                  to={`/use-cases/${slug}`}
                  className={
                    theme.comingLater
                      ? "mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800/40"
                      : `mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition bg-slate-500 hover:bg-slate-600`
                  }
                >
                  See the intended flow{" "}
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </motion.article>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}
