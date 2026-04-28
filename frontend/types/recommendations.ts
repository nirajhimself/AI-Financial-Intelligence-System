export type Duration = '1month' | '6months' | '1year' | '3years';
export type Market   = 'india' | 'us';
export type SortKey  = 'expected_return_percent' | 'confidence' | 'investment' | 'future_value';

export interface RecommendationInput {
  amount:   number;
  duration: Duration;
  market:   Market;
}

export interface StockRecommendation {
  symbol:                  string;
  investment:              number;
  expected_return_percent: number;
  future_value:            number;
  confidence:              number;
}

export interface RecommendationResponse {
  stocks:                   StockRecommendation[];
  portfolio_future_value:   number;
  portfolio_return_percent: number;
}

export const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: '1month',  label: '1 Month'  },
  { value: '6months', label: '6 Months' },
  { value: '1year',   label: '1 Year'   },
  { value: '3years',  label: '3 Years'  },
];

export const MARKET_OPTIONS: { value: Market; label: string; flag: string }[] = [
  { value: 'india', label: 'India (NSE/BSE)', flag: '🇮🇳' },
  { value: 'us',    label: 'United States',   flag: '🇺🇸' },
];
