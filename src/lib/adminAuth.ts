import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "your-supabase-url" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key";

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const adminAuth = {
  isMock: !isSupabaseConfigured,

  async signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
      // Mock Sign In
      if (email === "admin@agrawalhouse.com" && password === "admin123") {
        if (typeof window !== "undefined") {
          localStorage.setItem("ah_admin_session", "mock-session-token-123");
        }
        return { success: true };
      }
      return {
        success: false,
        error: "Invalid credentials. Use admin@agrawalhouse.com and admin123",
      };
    }
  },

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ah_admin_session");
      }
    }
  },

  async getSession(): Promise<boolean> {
    if (supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        return false;
      }
      return true;
    } else {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem("ah_admin_session");
        return !!session;
      }
      return false;
    }
  },
};
