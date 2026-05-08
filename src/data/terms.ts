export interface TermsSection {
  title: string;
  content?: string;
  points?: string[];
}

export interface TermsTopCard {
  title: string;
  desc: string;
}

/** Mirrors `TermsPage` in messages JSON (loaded via next-intl). */
export interface TermsPageMessages {
  topCards: TermsTopCard[];
  sections: TermsSection[];
}
