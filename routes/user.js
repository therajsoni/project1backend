import express from "express"

import {deleteUser, getAllUsers, getUser, newUser}  from '../controllers/user.js'
import { adminOnly } from "../middleware/auth.js"

const app = express.Router()

// /api/v1/new
app.post('/new',newUser)

app.get("/all", adminOnly,getAllUsers)

// app.get("/:id",getUser)

// app.delete('/:id',deleteUser)

app.route("/:id").get(getUser).delete(adminOnly,deleteUser)

export default app;