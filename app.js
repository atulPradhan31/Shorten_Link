<<<<<<< HEAD
=======
require("express-async-errors");

>>>>>>> origin/master
const express = require("express");
const connectDB = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");
const linkRouter = require("./routes/linkRoutes");
const app = express();
<<<<<<< HEAD

const port = process.env.PORT || 3000;

app.use(express.json());
connectDB();
=======
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json());

const userRouter = require("./routes/userRouter");
const publicRouter = require("./routes/publicRouter");
const authRouter = require("./routes/authRouter");
>>>>>>> origin/master

app.use("/user", userRouter);
app.use("/", publicRouter);
app.use("/accounts", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

<<<<<<< HEAD

app.listen(port, () => console.log(`Server is listening on the port ${port}`));
=======
app.listen(port, () => console.log("Server is up at ", port));
>>>>>>> origin/master
