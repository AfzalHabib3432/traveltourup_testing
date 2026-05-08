"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedUnderlineProps {
  title?: string;
  isCenter?: boolean;
  subtitle2?: string;
  className?: string;
  /** When true, title/subtitle use RTL typography; decorative underline stays LTR. */
  rtl?: boolean;
}

const AnimatedUnderline = ({
  title = "",
  isCenter,
  subtitle2,
  className = "",
  rtl = false,
}: AnimatedUnderlineProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.0 },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const titleTypography = cn(
    "text-2xl md:text-[2.5rem] font-extrabold tracking-tight text-foreground",
    rtl && "[unicode-bidi:isolate] !text-start",
    !rtl && isCenter && "text-center",
  );

  return (
    <div className={cn("mb-4", rtl && "w-full", className)}>
      {subtitle2 ? (
        <h6
          dir={rtl ? "rtl" : undefined}
          className={
            rtl
              ? cn(
                  "[unicode-bidi:isolate] !text-start text-muted-foreground",
                )
              : undefined
          }
        >
          {subtitle2}
        </h6>
      ) : null}

      {rtl ? (
        <motion.h2
          dir="rtl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ type: "spring", stiffness: 100 }}
          className={titleTypography}
        >
          {title}
        </motion.h2>
      ) : (
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className={titleTypography}
        >
          {title.split("").map((char, index) => (
            <motion.span key={index} variants={childVariants} className="inline-block">
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h2>
      )}

      {/* Decorative row: physical left→right gradient; position matches heading alignment */}
      <div
        dir="ltr"
        className={cn(
          "mt-2 flex items-center gap-1.5",
          rtl ? "justify-end" : isCenter ? "justify-center" : "",
        )}
      >
        {[0.4, 0.7, 1].map((op, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="h-2 w-2 rounded-full bg-primary"
            style={{ opacity: op }}
          />
        ))}

        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "5rem" }}
          transition={{ delay: 0.8, duration: 0.8, ease: "circOut" }}
          className="h-1.5 rounded-full bg-gradient-to-r from-primary via-primary/80 to-transparent relative overflow-hidden"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedUnderline;
