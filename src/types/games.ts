export interface GameVolatility {
  id: string;
  name: string;
  created_at: string;
}

export interface GameStatus {
  id: string;
  name: string;
  created_at: string;
}

export interface GameType {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  paylines?: number;
  max_payout?: string;
  reels_rows?: string;
  hit_frequency?: string;
  games_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  games_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Mechanic {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Denomination {
  id: string;
  name: string;
  currency_id: string;
  min_bet: number;
  max_bet: number;
  available_bets: number[];
  created_at: string;
  updated_at: string;
  currency?: {
    id: string;
    name: string;
    code: string;
    symbol: string;
  };
}

export interface Trailer {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  trailer_date?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GameRating {
  id: string;
  game_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface Game {
  id: string;
  name: string;
  game_type_id?: string;
  trailer_release_date?: string;
  integration_date?: string;
  rtp?: number;
  volatility_id?: string;
  status_id?: string;
  multimedia_pack_url?: string;
  created_at: string;
  updated_at: string;
  game_type?: GameType;
  volatility?: GameVolatility;
  status?: GameStatus;
  themes?: Theme[];
  mechanics?: Mechanic[];
  denominations?: Denomination[];
  trailers?: Trailer[];
  ratings?: GameRating[];
  average_rating?: number;
}

export interface GameTheme {
  id: string;
  game_id: string;
  theme_id: string;
  created_at: string;
}

export interface GameMechanic {
  id: string;
  game_id: string;
  mechanic_id: string;
  created_at: string;
}

export interface GameDenomination {
  id: string;
  game_id: string;
  denomination_id: string;
  created_at: string;
}
