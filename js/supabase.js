// Supabase Client Configuration - Singleton Pattern
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize the Supabase client with your project URL and anon key
const supabaseUrl = 'https://ytjpbnkksgawikffgtfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0anBibmtrc2dhd2lrZmZndGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDY5NzcsImV4cCI6MjA2NjMyMjk3N30.k_JUe3Uag5AizMl5B-OJ7oRYKuCEzL9xIG98h_3SmTc';

// Create a singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance = null;

function getSupabaseClient() {
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseKey, {
            auth: {
                storageKey: 'auirphila-bakery-auth-storage', // Use a unique storage key
                autoRefreshToken: true,
                persistSession: true
            }
        });
    }
    return supabaseInstance;
}

const supabase = getSupabaseClient();

export { supabase };
