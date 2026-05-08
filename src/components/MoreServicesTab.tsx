"use client";

import React from "react";
import { useTranslations } from "next-intl";

function MoreServicesTab() {
  const t = useTranslations("MoreServices");

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground font-medium">{t("message")}</p>
    </div>
  );
}

export default MoreServicesTab;
