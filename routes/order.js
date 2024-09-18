import express from "express"

import { adminOnly } from "../middleware/auth.js"

import {allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder} from "../controllers/order.js"

const app = express.Router()

app.post("/new",newOrder)

app.get("/my",myOrders)

app.get("/all",adminOnly,allOrders)

app.route("/:id").get(getSingleOrder).delete(adminOnly,deleteOrder).put(adminOnly,processOrder)

export default app;

//morgan