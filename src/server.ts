import app from "./app";
import logger from "./config/winston.config";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(
      `Failed to start server: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

startServer();
