import express from "express";
import { connectDB } from "./utils/features.js";
import userRoute from "./routes/user.js";
import { errorMiddleware } from "./middleware/error.js";
import productRoute from "./routes/products.js";
import NodeCache from "node-cache";
import orderRoute from "./routes/order.js";
import { config } from "dotenv";
import morgan from "morgan";
import paymentRoute from './routes/payment.js'
import dashboardRoute from './routes/stats.js'
import Stripe from 'stripe'
import cors from 'cors';

const app = express();

config({
  path: "./.env",
});


const port = process.env.PORT || 4000;
const stripeKEY = process.env.STRIPE_KEY || "";

connectDB();

export const stripe = new Stripe(stripeKEY);
export const myCache = new NodeCache();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// app.use(cors({origin: "",methods: ["GET", "POST"]))}

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment",paymentRoute)
app.use("/api/v1/dashboard",dashboardRoute)

// static for url set
app.use("/uploads", express.static("uploads"));


app.use(errorMiddleware);

app.listen(port, () => console.log(`${port}`));
