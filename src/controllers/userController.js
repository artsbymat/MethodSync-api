export const refreshToken = async (req, res) => {
  const refresh_token = req.cookies["sb-refresh-token"];

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error) return res.status(401).json({ error: "Token refresh failed" });

  res.setHeader("Set-Cookie", [
    `sb-access-token=${data.session.access_token}; Path=/; HttpOnly`,
    `sb-refresh-token=${data.session.refresh_token}; Path=/; HttpOnly`,
  ]);

  return res.status(200).json({ message: "Token refreshed" });
};
