require("express-async-errors");

const cors = require("cors");
const express = require("express");
const connectDB = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cors());

const userRouter = require("./routes/userRouter");
const publicRouter = require("./routes/publicRouter");
const authRouter = require("./routes/authRouter");

app.use("/user", userRouter);
app.use("/", publicRouter);
app.use("/accounts", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () => console.log("Server is up at ", port));
