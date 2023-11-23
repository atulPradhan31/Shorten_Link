require("express-async-errors");

const express = require("express");
const connectDB = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
connectDB();

app.use(express.json());

const userRouter = require("./routes/userRouter");
const publicRouter = require("./routes/publicRouter");
const authRouter = require("./routes/authRouter");
const clientRouter = require("./routes/clientRouter");

app.use(cors());

app.use("/", publicRouter);
app.use("/user", userRouter);
app.use("/accounts", authRouter);
app.use("/client", clientRouter);

app.use("/startserver",(req, res) => {
    res.status(200).send({message : "Server started"})
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () => console.log("Server is up at ", port));
