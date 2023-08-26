require("express-async-errors");

const express = require("express");
const connectDB = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json());

const linkRouter = require("./routes/linkRoutes");
const userRouter = require("./routes/userRouter");

app.use("/user", linkRouter);
app.use("/", userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


app.listen(port, () => console.log("Server is up at ", port))
