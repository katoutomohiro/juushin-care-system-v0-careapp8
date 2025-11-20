export type SeizureType = '強直間代' | 'ピク付き' | '上視線' | 'ミオクロニー' | '欠神' | '不明';

export type Tables = {
  seizures: {
    Row: {
      id: string;
      user_id: string;
      episode_at: string; // timestamptz
      type: SeizureType;
      duration_seconds: number | null;
      triggers: string[] | null;
      interventions: string[] | null;
      note: string | null;
      reporter_id: string;
      created_at: string | null;
    };
    Insert: {
      user_id: string;
      episode_at: string;
      type: SeizureType;
      duration_seconds?: number | null;
      triggers?: string[] | null;
      interventions?: string[] | null;
      note?: string | null;
      reporter_id: string;
      created_at?: string | null;
    };
  };
};
