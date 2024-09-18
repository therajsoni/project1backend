import mongoose from "mongoose";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: process.env.DATABASE,
    })
    .then((c) => {
      console.log(`Connected ${c.connection.host}`);
    })
    .catch((error) => {
      console.log(error);
    });
};

export const invalidateCache = ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}) => {
  if (product) {
    const productKeys = [
      "latest-products",
      "categories",
      "all-products",
      // `product-${productId}`
    ];
    // const products = await Product.find({}).select("_id");
    // products.forEach((i) => {
    //   productKeys.push(`product-${i._id}`);
    // });

    if (typeof productId === "string") {
      productKeys.push(`product-${productId}`);
      console.log(`B`);
    } else if (Array.isArray(productId)) {
      productId.forEach((i) => productKeys.push(`product-${i}`));
      console.log(`A`);
    }

    myCache.del(productKeys);
  }

  if (order) {
    const ordersKeys = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];
    // const orders = await order.find({}).select("_id");
    // orders.forEach((i) => {
    //   ordersKeys.push(`order-${i._id}`);
    // });
    myCache.del(ordersKeys);
  }

  if (admin) {
    myCache.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];

    const product = await Product.findById(order.productId);

    if (!product) throw new Error("Product Not Found");

    product.stock -= order.quantity;

    await product.save();
  }
};

export const calculatePercentage = (thisMonth, lastMonth) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

export const getInventories = async ({ categories, productCount }) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category }) // ye use spefic field ka count dega
  );
  const categoriesCount = await Promise.all(categoriesCountPromise);
  const categoryCount = [];
  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round(categoriesCount[i] / productCount) * 100,
    });
  });
  return categoriesCount;
};

export const getChartData = ({ length, docArr, today, property }) => {
  const data = new Array(length).fill(0);
  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
    if (property) {
      data[length - monthDiff - 1] += i[property];
    } else {
      data[length - monthDiff - 1] += 1;
    }
  });
  return data;
};
