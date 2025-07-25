import { supabase } from "../utils/supabase.js";

export const registerUser = async (req, res) => {
  const { display_name, email, password } = req.body;

  if (!display_name || !email || !password) {
    return res
      .status(400)
      .send("display_name, email, and password are required");
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: display_name,
        },
      },
    });

    if (error) throw error;

    res
      .status(200)
      .json({ message: "User registered successfully", user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

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

  res.status(200).json({ message: "Login successful", user: data.user });
};

export const forgotPassword = (req, res) => {
  res.send("Password reset link sent to your email");
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("sb-access-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.clearCookie("sb-refresh-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error logging out user. Please try again later." });
  }
};
