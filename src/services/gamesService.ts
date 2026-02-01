import { supabase } from '../lib/supabase';
import type {
  Game,
  GameType,
  Theme,
  Mechanic,
  Denomination,
  GameVolatility,
  GameStatus,
} from '../types/games';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la operación' }));
    throw new Error(error.error || error.message || 'Error en la operación');
  }

  return response.json();
}

export const gamesService = {
  async getGames(): Promise<Game[]> {
    return fetchAPI('games-list');
  },

  async getGame(id: string): Promise<Game> {
    return fetchAPI(`games-get?id=${id}`);
  },

  async createGame(data: Partial<Game>): Promise<Game> {
    return fetchAPI('games-create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGame(id: string, data: Partial<Game>): Promise<Game> {
    return fetchAPI('games-update', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteGame(id: string): Promise<void> {
    return fetchAPI('games-delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  async getGameTypes(): Promise<GameType[]> {
    const { data, error } = await supabase
      .from('game_types')
      .select('*, games(count)')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(type => ({
      ...type,
      games_count: type.games?.[0]?.count || 0
    }));
  },

  async createGameType(data: Partial<GameType>): Promise<GameType> {
    return fetchAPI('game-types-create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGameType(id: string, data: Partial<GameType>): Promise<GameType> {
    return fetchAPI('game-types-update', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteGameType(id: string): Promise<void> {
    return fetchAPI('game-types-delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  async getThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const themes = data || [];

    const themesWithCounts = await Promise.all(
      themes.map(async (theme) => {
        const { count, error: countError } = await supabase
          .from('games_themes')
          .select('*', { count: 'exact', head: true })
          .eq('theme_id', theme.id);

        return {
          ...theme,
          games_count: countError ? 0 : (count || 0)
        };
      })
    );

    return themesWithCounts;
  },

  async createTheme(data: Partial<Theme>): Promise<Theme> {
    return fetchAPI('themes-create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTheme(id: string, data: Partial<Theme>): Promise<Theme> {
    return fetchAPI('themes-update', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteTheme(id: string): Promise<void> {
    return fetchAPI('themes-delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  async getMechanics(): Promise<Mechanic[]> {
    const { data, error } = await supabase
      .from('mechanics')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMechanic(data: Partial<Mechanic>): Promise<Mechanic> {
    return fetchAPI('mechanics-create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMechanic(id: string, data: Partial<Mechanic>): Promise<Mechanic> {
    return fetchAPI('mechanics-update', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteMechanic(id: string): Promise<void> {
    return fetchAPI('mechanics-delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  async getDenominations(): Promise<Denomination[]> {
    const { data, error } = await supabase
      .from('denominations')
      .select(`
        *,
        currency:expenses_currencies(id, name, code, symbol)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createDenomination(data: Partial<Denomination>): Promise<Denomination> {
    return fetchAPI('denominations-create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateDenomination(id: string, data: Partial<Denomination>): Promise<Denomination> {
    return fetchAPI('denominations-update', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteDenomination(id: string): Promise<void> {
    return fetchAPI('denominations-delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  async getVolatilities(): Promise<GameVolatility[]> {
    const { data, error } = await supabase
      .from('game_volatilities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getGameStatuses(): Promise<GameStatus[]> {
    const { data, error } = await supabase
      .from('game_statuses')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async uploadGameImage(file: File, gameId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${gameId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('game-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error('Error al subir la imagen');
    }

    const { data } = supabase.storage
      .from('game-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadCatalogImage(file: File, catalogId: string, catalogType: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${catalogType}-${catalogId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('game-catalog-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error('Error al subir la imagen del catálogo');
    }

    const { data } = supabase.storage
      .from('game-catalog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
