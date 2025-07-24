import { createClient } from "@supabase/supabase-js";

export const getUserProfile = async (req, res) => {
  const token = req.cookies["sb-access-token"];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user });
};
