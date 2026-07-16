import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import spiralBackground from "../../../assets/spiral.svg";
import { NaitrustLogo } from "../../utility/NaitrustLogo";
import { useTheme } from "@/hooks/useTheme";

interface PublicFormLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  children: ReactNode;
}

export function PublicFormLayout({
  eyebrow,
  title,
  description,
  highlights,
  children,
}: PublicFormLayoutProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-background">
      <div className="absolute inset-y-0 left-0 hidden w-[48%] bg-[#eef3f8] dark:bg-[#0A0E1A] lg:block" />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[.92fr_1.08fr] lg:px-8">
        <aside className="relative overflow-hidden rounded-3xl bg-[#eef3f8] dark:bg-[#0A0E1A] p-7 text-white sm:p-10 lg:rounded-none lg:bg-transparent">
          <img
            src={spiralBackground}
            alt=""
            className="pointer-events-none absolute -bottom-56 -left-44 h-[720px] w-[720px] max-w-none opacity-40"
          />
          <div className="relative">
            <NaitrustLogo size="postMd" showText className={isDarkMode ? "text-white" : "text-gray-900"} />
            <p className="mt-16 text-sm font-semibold uppercase tracking-[.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-bold leading-tight mt-3 max-w-md text-[#0b2b45] dark:text-white">
              {title}
            </h1>
            <p className="mt-5 max-w-md leading-7 text-[#496274] dark:text-blue-100">
              {description}
            </p>
            <div className="mt-9 max-w-md space-y-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white dark:bg-white/5 p-4 text-sm text-[#496274] dark:text-blue-50"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-primary"
                    size={18}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex items-center justify-center py-4 lg:py-10">
          <div className="w-full max-w-xl rounded-3xl border bg-card p-6 shadow-2xl sm:p-9">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
