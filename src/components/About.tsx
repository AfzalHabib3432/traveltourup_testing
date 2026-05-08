"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Car, Hotel, CalendarCheck, Headphones } from "lucide-react";

import { Card, HistoryCardData } from "./ui";
import AboutAchievements from "./ui/AboutAchievements";
import SpecialCard from "./SpecialCard";
import AnimatedReviews from "./ui/AnimatedReviews";
import FaqS from "./FaqS";

const AboutPageHistoryAnimation = dynamic(
  () => import("./ui/AboutPageHistoryAnimation"),
  { ssr: false },
);

export function useAboutHistoryCard(): HistoryCardData {
  const t = useTranslations("About");
  return {
    title: t("historyTitle"),
    subtitle: t("historySubtitle"),
    description: t("historyDescription"),
    features: [
      {
        icon: <Car className="w-8 h-8" />,
        title: t("feat1"),
      },
      {
        icon: <Hotel className="w-8 h-8" />,
        title: t("feat2"),
      },
      {
        icon: <CalendarCheck className="w-8 h-8" />,
        title: t("feat3"),
      },
      {
        icon: <Headphones className="w-8 h-8" />,
        title: t("feat4"),
      },
    ],
  };
}

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const historyCardData = useAboutHistoryCard();

  return (
    <div className="min-h-screen  ">
      <section className="bg-muted">
        <div className="py-8 md:py-16   px-4 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-stretch container mx-auto">
          {/* Left: main history card via generic Card */}
          <div className="lg:col-span-6 h-full flex">
            <Card
              variant="history"
              data={historyCardData}
              className="my-auto w-full"
            />
          </div>

          {/* Right: 3D orbit image gallery */}
          <div className="lg:col-span-6 h-full flex">
            <AboutPageHistoryAnimation />
          </div>
        </div>
      </section>
      <section className="py-2 md:py-10 bg-muted/40 ">
        <AboutAchievements />
      </section>
      <section className="py-16 bg-muted">
        <SpecialCard />
      </section>
      <section className="bg-muted/40">
        <AnimatedReviews />
      </section>
      <section className="bg-muted">
        <FaqS limit={5}/>
      </section>
    </div>
  );
};

export default AboutUs;
