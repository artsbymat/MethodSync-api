import { createClient } from "@supabase/supabase-js";

export const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies["sb-access-token"];
  const refreshToken = req.cookies["sb-refresh-token"];

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );

  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: "Token expired, please login again" });
    }

    const refreshClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
    const { data, error: refreshError } =
      await refreshClient.auth.refreshSession({ refresh_token: refreshToken });

    if (refreshError) {
      return res.status(401).json({ error: "Failed to refresh token" });
    }

    // Save refreshed token
    res.cookie("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: true,
      path: "/",
    });
    res.cookie("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    req.user = data.user;
    return next();
  }

  req.user = user.user;
  next();
};
