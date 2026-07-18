import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SEOHead } from "../utility/SEOHead";
import { Badge } from "../ui/badge";
import { useCases } from "../../libs/use-cases";

const cardThemes = [
  { bar: 'from-blue-500 to-cyan-500', icon: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', audience: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200', link: 'bg-blue-600 hover:bg-blue-700' },
  { bar: 'from-emerald-500 to-teal-500', icon: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', audience: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200', link: 'bg-emerald-600 hover:bg-emerald-700' },
  { bar: 'from-violet-500 to-fuchsia-500', icon: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300', audience: 'bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200', link: 'bg-violet-600 hover:bg-violet-700' },
  { bar: 'from-amber-500 to-orange-500', icon: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', audience: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200', link: 'bg-amber-600 hover:bg-amber-700' },
] as const;

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
            Clearer records for Nigerian property transactions
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Naitrust is being built for property transactions where participant identity,
            clear terms, payment records, documents, and evidence matter. It does not list
            or sell properties.
          </p>
          <p className="mt-5 text-sm font-medium text-blue-300">
            Coming soon · Join the waiting list for launch updates
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map(
            ({ slug, icon: Icon, title, audience, summary }, index) => {
              const theme = cardThemes[index % cardThemes.length];
              return (
              <motion.article
                key={slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.05 }}
                className="group relative flex min-h-80 flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.bar}`} />
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.icon}`}>
                  <Icon size={24} />
                </div>
                <p className={`mt-5 w-fit rounded-full px-3 py-1.5 text-xs font-bold leading-5 ${theme.audience}`}>
                  {audience}
                </p>
                <h2 className="mt-2 text-xl font-bold">{title}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {summary}
                </p>
                <Link
                  to={`/use-cases/${slug}`}
                  className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${theme.link}`}
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
