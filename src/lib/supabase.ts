import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wqdbvjxsxcjwifnfgkjf.supabase.co";
const supabaseAnonKey = "sb_publishable_s84fExZo-ByvqVqJ2ymrDg_eP_LE6GM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
