import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SEOHead } from "../utility/SEOHead";
import { Badge } from "../ui/badge";
import { useCases } from "../../libs/use-cases";

export function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Naitrust Use Cases"
        description="Explore how Naitrust is being designed to support safer supplier orders, contractor work, social commerce, property payments and other serious transactions."
        canonicalPath="/use-cases"
      />
      <section className="bg-[#031335] dark:bg-[#0A0E1A] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Badge className="mb-5 bg-white/10 text-white hover:bg-white/10">
            Use cases
          </Badge>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Safer transaction records for the deals people already make
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Naitrust is being built for transactions where identity, clear terms
            and evidence matter. Explore the intended flow for each situation
            below.
          </p>
          <p className="mt-5 text-sm font-medium text-blue-300">
            Coming soon · Join the waiting list for launch updates
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map(
            ({ slug, icon: Icon, title, audience, summary }, index) => (
              <motion.article
                key={slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.05 }}
                className="group flex min-h-72 flex-col rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={24} />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
                  {audience}
                </p>
                <h2 className="mt-2 text-xl font-bold">{title}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {summary}
                </p>
                <Link
                  to={`/use-cases/${slug}`}
                  className="mt-5 inline-flex items-center gap-2 font-semibold text-primary"
                >
                  See the intended flow{" "}
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </motion.article>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
