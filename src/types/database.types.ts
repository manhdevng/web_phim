export type SubscriptionTier = "Free" | "Premium" | "VIP";

export interface Movie {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  release_year: number | null;
  duration: string | null;
  rating: number | null;
  genre: string | null;
  trailer_url: string | null;
  badge: string | null;
  section: string | null;
  embedding?: number[] | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  movie_id: string;
  progress_seconds: number;
  last_watched_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  movie_id: string;
  user_id: string;
  content: string;
  is_admin: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string | null;
  email: string;
  role: "owner" | "admin" | "editor";
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: Movie;
        Insert: Omit<Movie, 'id' | 'created_at'>;
        Update: Partial<Omit<Movie, 'id' | 'created_at'>>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'subscription_tier' | 'subscription_expires_at'> & Partial<Pick<Profile, 'subscription_tier' | 'subscription_expires_at'>>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      watch_history: {
        Row: WatchHistory;
        Insert: Omit<WatchHistory, 'id' | 'last_watched_at'> & Partial<Pick<WatchHistory, 'last_watched_at'>>;
        Update: Partial<Omit<WatchHistory, 'id' | 'user_id' | 'movie_id'>>;
        Relationships: [];
      };
      watchlists: {
        Row: Watchlist;
        Insert: Omit<Watchlist, 'id' | 'created_at'>;
        Update: Partial<Omit<Watchlist, 'id' | 'user_id' | 'movie_id'>>;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_admin' | 'is_pinned'>;
        Update: Partial<Omit<Comment, 'id' | 'user_id' | 'movie_id' | 'created_at'>>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at' | 'active' | 'role'> & Partial<Pick<AdminUser, 'active' | 'role'>>;
        Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: {
      comment_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      match_movies: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
        };
        Returns: Array<
          Omit<Movie, "embedding" | "created_at"> & {
            similarity: number;
          }
        >;
      };
    };
  };
}
