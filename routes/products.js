import express from "express";
import { getAllCategories, getLatestProducts, newProduct,getAdminProducts, getSingleProduct, uplateProduct, deleteProduct, getAllProducts } from "../controllers/product.js";
import { singleUpload } from "../middleware/multer.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router()

app.post("/new",adminOnly,singleUpload,newProduct)

app.get("/latest",getLatestProducts)

//products with filter
app.get("/all",getAllProducts)

app.get('/categories',getAllCategories)

app.get('/admin-products',getAdminProducts)

app.route('/:id').get(getSingleProduct).put(adminOnly,singleUpload,uplateProduct).delete(adminOnly,deleteProduct);

export default app;

