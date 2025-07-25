import { getSupabaseClientWithToken } from "../utils/supabase.js";

export const getChallenges = async (req, res) => {
  const user = req.user;

  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  const page = parseInt(req.query.page) || 1;
  const pageSize = 3;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .is("deleted_at", null)
    .or(
      `is_published.eq.true,and(author_id.eq.${user.id},is_published.eq.false)`,
    )
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

export const createChallenge = async (req, res) => {
  const user = req.user;
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

  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  try {
    const { data, error } = await supabase
      .from("challenges")
      .insert({
        ...challengeData,
        hints: challengeData.hints || [],
        starter_code: challengeData.starter_code || "",
        test_cases: challengeData.test_cases,
        estimated_time: challengeData.estimated_time || 0,
        is_published: challengeData.is_published || false,
        author_id: user.id,
        is_valid: false,
      })
      .select();

    if (error) {
      console.error("Insert Error:", error);
      throw error;
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
  const user = req.user;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Challenge ID is required" });
  }

  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  try {
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
  const user = req.user;
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ error: "Challenge ID is required" });
  }

  const restrictedFields = ["id", "author_id", "created_at"];
  for (const field of restrictedFields) {
    if (updateData[field]) {
      return res.status(400).json({
        error: `Cannot update restricted field: ${field}`,
      });
    }
  }

  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  try {
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("challenges")
      .update(updateData)
      .match({ id, author_id: user.id })
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

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
