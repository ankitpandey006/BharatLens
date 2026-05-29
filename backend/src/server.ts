import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`BharatLens backend running on http://localhost:${PORT}`);
});