// Centralized Supabase config for the browser (Vite)
// Values come from Vite env vars. In Vercel, set these in Project → Settings → Environment Variables.
// Locally, create a frontend/.env.local with the same names.

export const projectId = (import.meta as any).env.VITE_SUPABASE_PROJECT_ID as string;
export const publicAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;
export const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;

// Optional: if you invoke a specific Edge Function by slug, set it via env too
export const supabaseFunctionSlug = (import.meta as any).env.VITE_SUPABASE_FUNCTION_SLUG as string | undefined;

if (!publicAnonKey || !(supabaseUrl || projectId)) {
  // Provide a clear runtime error to help configuration
  throw new Error(
    "Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PROJECT_ID)."
  );
}
