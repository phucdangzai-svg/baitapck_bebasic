import "dotenv/config";
import express from "express";
import { connectionDb } from "./configs/db.config.js";
import routes from "./routes/index.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/error.middleware.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

connectionDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server chạy ở cổng ${PORT}`);
  });
});
