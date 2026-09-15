import "dotenv/config";
import app from "./app.js";
import { ensureDatabaseConnection } from "./config/database.js";

const port = Number(process.env.PORT ?? 4000);
ensureDatabaseConnection()
  .then(() => app.listen(port, () => console.log(`CarNote API running on http://localhost:${port}`)))
  .catch((error) => {
    console.error("Could not connect to MongoDB. Set MONGODB_URI in server/.env and make sure MongoDB is running.", error);
    process.exit(1);
  });
