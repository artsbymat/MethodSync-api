import { runTestCase } from "../utils/grader.js";

export const gradeCode = async (req, res) => {
  const { code, testCases } = req.body;

  if (!code || !testCases) {
    return res.status(400).json({ error: "Missing code or testCases" });
  }

  const results = runTestCase(code, testCases);

  return res.json({
    score: results.filter((r) => r.passed).length,
    total: results.length,
    results,
  });
};
