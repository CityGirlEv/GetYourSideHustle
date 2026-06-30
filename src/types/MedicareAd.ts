export type MedicareAd = {
  companyName: string;
  websiteUrl: string;
  socialMedia: {
    facebook: string;
    tiktok: string;
    other: string[];
  };
  adUrl: string;
  primaryText: string;
  description: string;
  headline: string;
  hooks: string[];
  painPoints: string[];
  keywords: string[];
  hashtags: string[];
  reviewSnippets: string[];
  /** Optional review excerpts with deep links to source pages. */
  reviews?: { text: string; url: string; sourceLabel?: string }[];
};
