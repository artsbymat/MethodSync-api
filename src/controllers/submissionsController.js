import { getSupabaseClientWithToken } from "../utils/supabase.js";
import { extractFunctionNames, runTestCase } from "../utils/grader.js";

export const getSubmissionChallenge = async (req, res) => {
  const user = req.user;
  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  const { challenge_id } = req.query;

  if (!challenge_id) {
    return res.status(400).json({ error: "Missing id_challenge" });
  }

  try {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("challenge_id", challenge_id)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Submission Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json({
      message: "Submission retrieved successfully",
      data,
    });
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const submitRegularChallenge = async (req, res) => {
  const user = req.user;
  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  const { id_challenge, user_code } = req.body;
  const { data: challengeData, error } = await supabase
    .from("challenges")
    .select("starter_code, test_cases")
    .eq("id", id_challenge)
    .single();

  if (error || !challengeData) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  if (!user_code) {
    return res.status(400).json({ error: "Missing user_code or test_cases" });
  }

  const { starter_code } = challengeData;

  // get function name from db
  const functionName = starter_code.match(/function\s+(\w+)/);

  // get function name from user_code
  const userFunctionName = extractFunctionNames(user_code);

  if (functionName[1] !== userFunctionName[0]) {
    return res.status(400).json({
      error: `Function name mismatch. Expected ${functionName[1]}, but got ${userFunctionName[0]}`,
    });
  }

  // Check test cases
  const resultTestCase = runTestCase(
    user_code,
    challengeData.test_cases,
    functionName[1],
  );

  if (!resultTestCase.passed) {
    return res.status(400).json({
      error: "Test cases failed",
      results: resultTestCase.results,
    });
  }

  // Insert submission into database
  try {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .insert({
        user_id: user.id,
        challenge_id: id_challenge,
        submitted_code: user_code,
        is_correct: resultTestCase.passed,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Submission Error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Submission created successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const resubmitRegularChallenge = async (req, res) => {
  const user = req.user;
  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  const { id_challenge, user_code } = req.body;

  if (!id_challenge || !user_code) {
    return res.status(400).json({ error: "Missing id_challenge or user_code" });
  }

  // Check if the challenge exists
  const { data: challengeData, error } = await supabase
    .from("challenges")
    .select("starter_code, test_cases")
    .eq("id", id_challenge)
    .single();

  if (error || !challengeData) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  const { starter_code } = challengeData;

  // get function name from db
  const functionName = starter_code.match(/function\s+(\w+)/);

  // get function name from user_code
  const userFunctionName = extractFunctionNames(user_code);

  if (functionName[1] !== userFunctionName[0]) {
    return res.status(400).json({
      error: `Function name mismatch. Expected ${functionName[1]}, but got ${userFunctionName[0]}`,
    });
  }

  // Check test cases
  const resultTestCase = runTestCase(
    user_code,
    challengeData.test_cases,
    functionName[1],
  );

  if (!resultTestCase.passed) {
    return res.status(400).json({
      error: "Test cases failed",
      results: resultTestCase.results,
    });
  }

  // Update submission in database
  try {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .update({
        submitted_code: user_code,
        is_correct: resultTestCase.passed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("challenge_id", id_challenge)
      .select();

    if (error) {
      console.error("Update Error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      message: "Submission updated successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteSubmissionChallenge = async (req, res) => {
  const user = req.user;
  const accessToken = req.cookies["sb-access-token"];
  const supabase = getSupabaseClientWithToken(accessToken);

  const { id_submission } = req.query;

  if (!id_submission) {
    return res.status(400).json({ error: "Submission ID is required" });
  }

  try {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .update({ deleted_at: new Date().toISOString() })
      .match({ id: id_submission, user_id: user.id })
      .select();

    if (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Submission not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      message: "Submission deleted successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
};
