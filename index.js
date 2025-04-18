import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./Routes/auth.js";
dotenv.config();
import userRoute from "./Routes/user.js";
dotenv.config();
import doctorRoute from "./Routes/doctor.js";
dotenv.config();
dotenv.config();
import reviewRoute from "./Routes/review.js";
dotenv.config();
import bookingRoute from "./Routes/booking.js";
import recommendRoute from "./Routes/recommend.js";

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: true,
};

app.get("/", (req, res) => {
  res.send("Api is Working");
});

//database connection
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB is Connected...");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/recommend", recommendRoute);

app.listen(port, () => {
  connectDB();
  console.log("server is running on port " + port);
});
