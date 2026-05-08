"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { Building2, MapPin, ThumbsUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Thin outer frame uses theme primary; thick rounded “L” on bottom-left */
function StatCornerAccent({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute z-[1] text-primary", className)}
      aria-hidden
    >
      <div className="absolute bottom-1 left-1 h-2.5 w-[3rem] rounded-full bg-current sm:h-3 sm:w-[3.25rem]" />
      <div className="absolute bottom-1 left-1 h-[3rem] w-2.5 rounded-full bg-current sm:h-[3.25rem] sm:w-3" />
    </div>
  );
}

type StatItem = {
  id: string;
  value: number;
  suffix: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const CountUp = ({ target, start }: { target: number; start: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    const duration = 1700;
    const startTime = performance.now();

    let frameId = 0;

    const updateCounter = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCounter);
      }
    };

    frameId = requestAnimationFrame(updateCounter);

    return () => cancelAnimationFrame(frameId);
  }, [target, start]);

  return <>{count.toLocaleString()}</>;
};

const StatsSection = () => {
  const t = useTranslations("Stats");
  const stats: StatItem[] = useMemo(
    () => [
      {
        id: "hotels",
        value: 5000,
        suffix: "+",
        title: t("hotelsTitle"),
        description: t("hotelsDesc"),
        icon: Building2,
      },
      {
        id: "destinations",
        value: 150,
        suffix: "+",
        title: t("destinationsTitle"),
        description: t("destinationsDesc"),
        icon: MapPin,
      },
      {
        id: "satisfaction",
        value: 98,
        suffix: "%",
        title: t("satisfactionTitle"),
        description: t("satisfactionDesc"),
        icon: ThumbsUp,
      },
    ],
    [t],
  );
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-0">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                className="relative mx-auto w-full"
              >
                {/* Thin outer frame + gap */}
                <div className="relative rounded-2xl border-2 border-primary p-2.5 shadow-sm sm:p-3">
                  <StatCornerAccent className="bottom-0 left-0" />

                  {/* Inner elevated card */}
                  <div className="relative z-[2] flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-muted px-6 py-9 text-center shadow-md ring-1 ring-border/60 dark:bg-card/80 dark:ring-border/40">
                    <Icon
                      className="mb-4 h-10 w-10 shrink-0 text-primary"
                      strokeWidth={1.75}
                      aria-hidden
                    />

                    <div className="text-4xl font-bold tracking-tight text-foreground tabular-nums sm:text-5xl">
                      <CountUp target={stat.value} start={isInView} />
                      <span>{stat.suffix}</span>
                    </div>

                    <h3 className="mt-3 max-w-[16rem] text-sm font-bold uppercase tracking-[0.12em] text-primary sm:text-base">
                      {stat.title}
                    </h3>

                    <p className="mt-3 max-w-[17rem] text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
