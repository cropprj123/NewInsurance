const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const userRouter = require("./routes/userRoute");
const insuranceRouter = require("./routes/insuranceRoute");
const cropRouter = require("./routes/predictionRoute");
const assignmentRouter = require("./routes/assignmentRoute");
const AppError = require("./utils/appErrors");

const app = express();
const cors = require("cors");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use(cookieparser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/insurance", insuranceRouter);
app.use("/api/v1/crops", cropRouter);
app.use("/api/v1/assign", assignmentRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`can't find the ${req.originalUrl} url`));
});

module.exports = app;
