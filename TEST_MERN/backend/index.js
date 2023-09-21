import express from "express";
import cors from "cors";
import logger from "morgan";
import mongoose from "mongoose";
import config from "./config.js";
import postsRouter from "./routes/publication.js";

const app = express();

const port = process.env.PORT || 3031;

const dbUrl = config.dbUrl;

const options = {
  keepAlive: 1,
  connectTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Using async/await syntax
const connectToDb = async () => {
  try {
    await mongoose.connect(dbUrl, options);
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
  }
};

// Initiating the connection
connectToDb();

app.use(logger("dev"));
app.use(cors());
app.use(express.urlencoded({ extended: true })); // This is for parsing `application/x-www-form-urlencoded`
app.use(express.json());  // This is for parsing `application/json`
app.use("/posts", postsRouter);

app.listen(port, () => {
  console.log("Running on " + port);
});

export default app;
