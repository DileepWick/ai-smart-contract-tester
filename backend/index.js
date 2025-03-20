import express from "express";
import cors from "cors";
import GPTRouter from "./routes/GPTRouter.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/gpt", GPTRouter); // Register the router

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});