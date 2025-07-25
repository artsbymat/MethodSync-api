import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getSupabaseClientWithToken = (accessToken) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
