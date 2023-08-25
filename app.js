require("dotenv").config();
require("express-async-errors");

const express = require("express");
const connectDB = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

const linkRouter = require("./routes/linkRoutes");

app.use("/homepage", linkRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(
      process.env.MONGO_URI,
      console.log("Connected to the database")
    );
    app.listen(port, console.log(`Server is listening on the port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
