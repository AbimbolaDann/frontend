export type Screen =
  | 'landing' // /
  | 'connect' // /connect
  | 'explore' // /explore
  | 'project' // /project/[id]
  | 'deposit' // /deposit
  | 'portfolio' // /portfolio
  | 'withdraw' // /withdraw

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
}

export interface ProjectFilters {
  search: string;
  type: string;
}

export type RiskScore = 'conservative' | 'moderate' | 'aggressive';

export type BondRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';

export interface BondPricePoint {
  date: string; // ISO date string (YYYY-MM-DD)
  price: number;
  yield: number;
}

export interface Bond {
  id: string;
  rating: BondRating;
  amount: number;
  history?: BondPricePoint[];
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: Bond[];
  riskScore: RiskScore;
}
