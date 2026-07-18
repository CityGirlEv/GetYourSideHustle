// src/types/LeadGenerator.ts
export interface LeadGenerator {
  companyName: string;
  websiteUrl: string;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}
