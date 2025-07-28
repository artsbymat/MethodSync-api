import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import graderRoutes from "./routes/graderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import submissionsRoutes from "./routes/submissionsRoutes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/api", (req, res) => {
  res.send("Express server is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/grader", graderRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
