// API client for backend communication

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types for API responses
export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
}

export interface LoginResponse extends ApiResponse {
  user_id?: number;
}

export interface BoardData {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  columns: ColumnData[];
}

export interface ColumnData {
  id: number;
  title: string;
  position: number;
  board_id: number;
  created_at: string;
  updated_at: string;
  cards: CardData[];
}

export interface CardData {
  id: number;
  title: string;
  details: string;
  position: number;
  column_id: number;
  created_at: string;
  updated_at: string;
}

export interface BoardResponse extends ApiResponse {
  board: BoardData;
}

export interface ColumnResponse extends ApiResponse {
  column: ColumnData;
}

export interface CardResponse extends ApiResponse {
  card: CardData;
}

// Authentication API
export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
    });

    return response.json();
  },
};

// Board API
export const boardApi = {
  async getBoard(userId: number = 1): Promise<BoardResponse> {
    const response = await fetch(`${API_BASE}/board?user_id=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch board');
    }

    return response.json();
  },
};

// Column API
export const columnApi = {
  async createColumn(boardId: number, title: string, position: number): Promise<ColumnResponse> {
    const response = await fetch(`${API_BASE}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ board_id: boardId, title, position }),
    });

    if (!response.ok) {
      throw new Error('Failed to create column');
    }

    return response.json();
  },

  async updateColumn(columnId: number, updates: { title?: string; position?: number }): Promise<ColumnResponse> {
    const response = await fetch(`${API_BASE}/columns/${columnId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update column');
    }

    return response.json();
  },

  async deleteColumn(columnId: number): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE}/columns/${columnId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete column');
    }

    return response.json();
  },
};

// Card API
export const cardApi = {
  async createCard(columnId: number, title: string, details: string, position: number): Promise<CardResponse> {
    const response = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ column_id: columnId, title, details, position }),
    });

    if (!response.ok) {
      throw new Error('Failed to create card');
    }

    return response.json();
  },

  async updateCard(cardId: number, updates: { title?: string; details?: string; position?: number }): Promise<CardResponse> {
    const response = await fetch(`${API_BASE}/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update card');
    }

    return response.json();
  },

  async moveCard(cardId: number, newColumnId: number, newPosition: number): Promise<CardResponse> {
    const response = await fetch(`${API_BASE}/cards/${cardId}/move?new_column_id=${newColumnId}&new_position=${newPosition}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to move card');
    }

    return response.json();
  },

  async deleteCard(cardId: number): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE}/cards/${cardId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete card');
    }

    return response.json();
  },
};