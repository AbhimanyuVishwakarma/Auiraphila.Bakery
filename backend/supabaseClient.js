const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ytjpbnkksgawikffgtfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0anBibmtrc2dhd2lrZmZndGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDY5NzcsImV4cCI6MjA2NjMyMjk3N30.k_JUe3Uag5AizMl5B-OJ7oRYKuCEzL9xIG98h_3SmTc'; // Use service role key for backend
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;