export interface PolicySection {
  title: string;
  content?: string;
  points?: string[];
}

export interface PrivacyTopCard {
  title: string;
  desc: string;
}

/** Mirrors `PrivacyPage` in messages JSON (loaded via next-intl). */
export interface PrivacyPageMessages {
  topCards: PrivacyTopCard[];
  sections: PolicySection[];
}
