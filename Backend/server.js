import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import tripsRoutes from "./routes/trips.js";
import mapsRoutes from "./routes/maps.js";
import { testSupabase } from "./helpers/supabase.js";

const app = express();
const PORT = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/trips", tripsRoutes);
app.use("/api/maps", mapsRoutes);

app.get("/api/test", (req, res) => {
  testSupabase();
  console.log("test");
  res.json({
    message: "Hello from the backend v2!",
    serverTime: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
