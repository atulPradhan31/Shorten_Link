const express = require("express");
const connectDB = require("./db/connect");
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");
const linkRouter = require("./routes/linkRoutes");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
connectDB();

app.use("/homepage", linkRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


app.listen(port, () => console.log(`Server is listening on the port ${port}`));