import "./src/config/env.js";
import app from "./src/app.js";
import { connectToDatabase } from "./src/config/db.js";

const port = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
