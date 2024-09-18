import express from "express";

import { adminOnly } from "../middleware/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
} from "../controllers/payment.js";

const app = express.Router();

app.post("/create" , createPaymentIntent)

app.get("/discount", applyDiscount);

app.get("/coupon/all",adminOnly, allCoupons);

app.post("/coupon/new",adminOnly, newCoupon);

app.delete("/coupon/:id",adminOnly,deleteCoupon);

export default app;
