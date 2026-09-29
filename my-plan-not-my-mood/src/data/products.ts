export interface Product {
  id: string;
  name: string;
  category: 'tees' | 'hoodies' | 'accessories' | 'planners';
  collection: 'original' | 'check-the-box' | 'midlife' | 'planners';
  price: number;
  description: string;
  colors: string[];
  sizes?: string[];
  heroText?: string;
  badge?: string;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'MY PLAN, NOT MY MOOD — Original Heavyweight Tee',
    category: 'tees',
    collection: 'original',
    price: 38.00,
    description: '100% Combed Ring-Spun Cotton (240 GSM). Modern relaxed unisex fit. Made for when your mood wants to collapse on the couch, but your schedule says you have an empire to build.',
    colors: ['Washed Black', 'Vintage Cream', 'Sage Green', 'Deep Espresso'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    heroText: 'MY PLAN, NOT MY MOOD',
    badge: 'BEST SELLER',
    image: '/images/apparel_tee_lifestyle.jpg',
  },
  {
    id: 'prod-002',
    name: 'Check The Box Heavyweight Hoodie',
    category: 'hoodies',
    collection: 'check-the-box',
    price: 68.00,
    description: '350 GSM Fleece Boxy Fit Hoodie. Features high-density screen print: ☐ Follow My Mood / ☑ Follow My Plan on the chest.',
    colors: ['Charcoal Grey', 'Vintage Cream', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    heroText: '☐ Follow My Mood / ☑ Follow My Plan',
    badge: 'SIGNATURE DROP',
    image: '/images/apparel_hoodie_mockup.jpg',
  },
  {
    id: 'prod-003',
    name: 'The "What\'s The Plan?" Daily Execution Desk Pad',
    category: 'planners',
    collection: 'planners',
    price: 18.00,
    description: '50 Tear-off Sheets (7" x 10" Desk Pad, 100 GSM Premium Paper). Features top 3 non-negotiables, mood trap warnings, and daily "What Won Today?" receipt check.',
    colors: ['Cream / Slate'],
    badge: 'ESSENTIAL UTILITY',
    image: '/images/planner_journal_mockup.jpg',
  },
  {
    id: 'prod-004',
    name: 'Hot Flash. High Ambition. Midlife Statement Tee',
    category: 'tees',
    collection: 'midlife',
    price: 38.00,
    description: 'Sophisticated relaxed tee for women navigating career reinvention, empty nesting, or perimenopause. Hormones on 10. Plan on 100.',
    colors: ['Washed Black', 'Deep Espresso', 'Terracotta'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    heroText: 'HOT FLASH. HIGH AMBITION.',
    badge: 'MIDLIFE HUMOR',
    image: '/images/apparel_tee_mockup.jpg',
  },
  {
    id: 'prod-005',
    name: 'Accountability Dad Cap',
    category: 'accessories',
    collection: 'original',
    price: 32.00,
    description: 'Unstructured chino twill cap with 3D embroidery: MY PLAN, NOT MY MOOD. Metal antique buckle strapback.',
    colors: ['Black', 'Khaki', 'Washed Navy'],
    heroText: 'MY PLAN, NOT MY MOOD',
    image: '/images/apparel_hoodie_mockup.jpg',
  },
  {
    id: 'prod-006',
    name: '90-Day Follow-Through Goal Journal',
    category: 'planners',
    collection: 'planners',
    price: 34.00,
    description: 'Linen-bound 90-day undated hardcover execution journal. Goal dissection worksheets, weekly review prompts, daily execution pages.',
    colors: ['Midnight Slate', 'Sage Green'],
    badge: 'PREMIUM UTILITY',
    image: '/images/planner_journal_mockup.jpg',
  },
];
