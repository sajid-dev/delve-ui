export type AdminSessionSummary = {
  session_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  tokens_used: number;
  latest_answer?: {
    session_id: string;
    timestamp: string;
  };
};

export type AdminUserSummary = {
  user_id: string;
  session_count: number;
  total_tokens: number;
  last_active?: string;
  is_active: boolean;
  sessions: AdminSessionSummary[];
};

export type AdminDashboard = {
  total_users: number;
  active_users: number;
  total_sessions: number;
  total_tokens: number;
  users: AdminUserSummary[];
};
