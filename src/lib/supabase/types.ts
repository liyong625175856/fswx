/**
 * 占位类型；接入真实表结构后使用 Supabase CLI 生成并替换。
 * npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DkCodeStatus = "unused" | "assigned";

export type Database = {
  public: {
    Tables: {
      dkusers: {
        Row: {
          id: number;
          created_at: string;
          name: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
        };
        Relationships: [];
      };
      dkcodes: {
        Row: {
          id: number;
          code: string;
          status: DkCodeStatus;
        };
        Insert: {
          id?: number;
          code: string;
          status?: DkCodeStatus;
        };
        Update: {
          id?: number;
          code?: string;
          status?: DkCodeStatus;
        };
        Relationships: [];
      };
      dkorders: {
        Row: {
          id: number;
          order_no: string;
          user_id: number;
          code_id: number;
          vip_type: string;
          amount: number;
          buy_time: string;
        };
        Insert: {
          id?: number;
          order_no: string;
          user_id: number;
          code_id: number;
          vip_type: string;
          amount: number;
          buy_time: string;
        };
        Update: {
          id?: number;
          order_no?: string;
          user_id?: number;
          code_id?: number;
          vip_type?: string;
          amount?: number;
          buy_time?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
