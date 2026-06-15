export type SeedPersona =
  | 'ENGINEERING'
  | 'PRODUCT'
  | 'GROWTH'
  | 'OPERATIONS'
  | 'SUCCESS'
  | 'DATA'
  | 'FINANCE'
  | 'SALES';

export interface SeedUserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  team: string;
  location: string;
  persona: SeedPersona;
  joinedDaysAgo: number;
}

export const ADMIN_PROFILE: SeedUserProfile = {
  name: 'Maya Thompson',
  email: 'maya.thompson@assetflow-demo.dev',
  username: 'admin',
  phone: '+44 20 7946 0110',
  team: 'Operations',
  location: 'London',
  persona: 'OPERATIONS',
  joinedDaysAgo: 540,
};

export const USER_PROFILES: SeedUserProfile[] = [
  {
    name: 'Elias Morgan',
    email: 'elias.morgan@assetflow-demo.dev',
    username: 'user',
    phone: '+30 21 5550 1401',
    team: 'Engineering',
    location: 'Athens',
    persona: 'ENGINEERING',
    joinedDaysAgo: 420,
  },
  {
    name: 'Sofia Bennett',
    email: 'sofia.bennett@assetflow-demo.dev',
    username: 'sofia.bennett',
    phone: '+49 30 5557 1021',
    team: 'Product',
    location: 'Berlin',
    persona: 'PRODUCT',
    joinedDaysAgo: 380,
  },
  {
    name: 'Lucas Reed',
    email: 'lucas.reed@assetflow-demo.dev',
    username: 'lucas.reed',
    phone: '+44 20 7946 0172',
    team: 'Growth',
    location: 'London',
    persona: 'GROWTH',
    joinedDaysAgo: 340,
  },
  {
    name: 'Nina Patel',
    email: 'nina.patel@assetflow-demo.dev',
    username: 'nina.patel',
    phone: '+31 20 5550 8812',
    team: 'Operations',
    location: 'Amsterdam',
    persona: 'OPERATIONS',
    joinedDaysAgo: 315,
  },
  {
    name: 'Zoe Carter',
    email: 'zoe.carter@assetflow-demo.dev',
    username: 'zoe.carter',
    phone: '+34 93 555 4412',
    team: 'Customer Success',
    location: 'Barcelona',
    persona: 'SUCCESS',
    joinedDaysAgo: 280,
  },
  {
    name: 'Daniel Kim',
    email: 'daniel.kim@assetflow-demo.dev',
    username: 'daniel.kim',
    phone: '+351 21 555 1020',
    team: 'Engineering',
    location: 'Lisbon',
    persona: 'ENGINEERING',
    joinedDaysAgo: 245,
  },
  {
    name: 'Ava Rossi',
    email: 'ava.rossi@assetflow-demo.dev',
    username: 'ava.rossi',
    phone: '+39 02 5555 9044',
    team: 'Product',
    location: 'Milan',
    persona: 'PRODUCT',
    joinedDaysAgo: 215,
  },
  {
    name: 'Marcus Hill',
    email: 'marcus.hill@assetflow-demo.dev',
    username: 'marcus.hill',
    phone: '+353 1 555 2250',
    team: 'Finance',
    location: 'Dublin',
    persona: 'FINANCE',
    joinedDaysAgo: 185,
  },
  {
    name: 'Priya Desai',
    email: 'priya.desai@assetflow-demo.dev',
    username: 'priya.desai',
    phone: '+34 91 555 8808',
    team: 'Growth',
    location: 'Madrid',
    persona: 'GROWTH',
    joinedDaysAgo: 155,
  },
  {
    name: 'Leo Andersson',
    email: 'leo.andersson@assetflow-demo.dev',
    username: 'leo.andersson',
    phone: '+46 8 555 0109',
    team: 'Operations',
    location: 'Stockholm',
    persona: 'OPERATIONS',
    joinedDaysAgo: 125,
  },
  {
    name: 'Chloe Nguyen',
    email: 'chloe.nguyen@assetflow-demo.dev',
    username: 'chloe.nguyen',
    phone: '+49 30 5557 1944',
    team: 'Data',
    location: 'Berlin',
    persona: 'DATA',
    joinedDaysAgo: 95,
  },
  {
    name: 'Ethan Walker',
    email: 'ethan.walker@assetflow-demo.dev',
    username: 'ethan.walker',
    phone: '+44 20 7946 0195',
    team: 'Sales',
    location: 'London',
    persona: 'SALES',
    joinedDaysAgo: 68,
  },
];
