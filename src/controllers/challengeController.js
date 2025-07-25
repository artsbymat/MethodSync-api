import { createClient } from "@supabase/supabase-js";

export const getChallenges = async (req, res) => {
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
    }
  );

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Query untuk mendapatkan challenges
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .is("deleted_at", null)
      .or(
        `is_published.eq.true,and(author_id.eq.${user.id},is_published.eq.false)`
      );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createChallenge = async (req, res) => {
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
    }
  );

  const { ...challengeData } = req.body;

  const requiredFields = [
    "title",
    "slug",
    "description",
    "difficulty",
    "category",
    "test_cases",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error: insertError } = await supabase
      .from("challenges")
      .insert({
        ...challengeData,
        hints: challengeData.hints || [],
        starter_code: challengeData.starter_code || "",
        test_cases: challengeData.test_cases,
        estimated_time: challengeData.estimated_time || 0,
        is_published: challengeData.is_published || false,
        author_id: user.id,
      })
      .select();

    if (insertError) {
      console.error("Insert Error:", insertError);
      throw insertError;
    }

    res.status(201).json({
      message: "Challenge created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteChallenge = async (req, res) => {
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
    }
  );

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Challenge ID is required" });
  }

  try {
    // Dapatkan user yang login
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Hapus challenge hanya jika user adalah author
    const { data, error } = await supabase
      .from("challenges")
      .update({ deleted_at: new Date().toISOString() })
      .match({ id, author_id: user.id })
      .select();

    if (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Challenge not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      message: "Challenge deleted successfully",
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChallenge = async (req, res) => {
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
    }
  );

  const { id } = req.query;
  const updateData = req.body;

  console.log(id);
  if (!id) {
    return res.status(400).json({ error: "Challenge ID is required" });
  }

  // Field yang tidak boleh diupdate
  const restrictedFields = ["id", "author_id", "created_at"];
  for (const field of restrictedFields) {
    if (updateData[field]) {
      return res.status(400).json({
        error: `Cannot update restricted field: ${field}`,
      });
    }
  }

  try {
    // Dapatkan user yang login
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Tambahkan updated_at
    updateData.updated_at = new Date().toISOString();

    // Update hanya jika user adalah author
    const { data, error } = await supabase
      .from("challenges")
      .update(updateData)
      .match({ id, author_id: user.id }) // Hanya update jika author_id sesuai
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Jika tidak ada data yang terupdate
    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Challenge not found or you don't have permission to update it",
      });
    }

    res.status(200).json({
      message: "Challenge updated successfully",
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
