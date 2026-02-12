import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ivkmpgmhweqdmtwxjwep.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a21wZ21od2VxZG10d3hqd2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzc1MTUsImV4cCI6MjA4NDcxMzUxNX0.2F1ut98QDNdBtpadokU6sGWlgMTbmZ7dLxbO36Fs1s8";

export const supabase = createClient(supabaseUrl, supabaseKey);
