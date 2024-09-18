import { TryCatch } from "../middleware/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import {faker} from '@faker-js/faker';
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";



// Revalidate on New , Update , Delete Product & on New Order
export const getLatestProducts = TryCatch(async (req, res, next) => {
//  ---------- cache use here it!
    let products;

    if(myCache.has("latest-products")) products = JSON.parse(myCache.get("latest-products"))
    else {
products = await Product.find({}).sort({ createdAt: 1 }).limit(5);
myCache.set("latest-products",JSON.stringify(products))    
}
// ---------- cache use here it!
    // createdAt : -1 descending Order and 1 ascending Order


  return res.status(200).json({
    success: true,
    message: "Product Created Successfully",
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
// ---------- cache use here it!
  let categories;
  
  if(myCache.has("categories"))categories = JSON.parse(myCache.get("categories"));
  else{
    const categories = await Product.distinct("category");
    myCache.set("categories",JSON.stringify(categories));
  }
// ---------- cache use here it!
  categories = await Product.distinct("category");
  return res.status(200).json({
    success: true,
    message: "Product categories Created Successfully",
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  // ---------- cache use here it!
  let products;  
  
  if(myCache.has("all-products")) products = JSON.parse(myCache.get("all-products"))
  else{ const products = await  Product.find({});
  myCache.set("all-products",JSON.stringify(products)) 
  }
// ---------- cache use here it!
  products = await Product.find({});
  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
 
  let product;

  const id = req.params.id

  if(myCache.has(`product-${id}`)){
  product = JSON.parse(myCache.get(`product-${id}`))
  }
  else{
    product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Invalid Product Id", 400));
    myCache.set(`product-${id}`,JSON.stringify(product))
  }
 
  return res.status(200).json({
    success: true,
    product,
  });
});



export const newProduct = TryCatch(async (req, res, next) => {
  const { name, price, stock, category } = req.body;
  const photo = req.file;

  if (!photo) return next(new ErrorHandler("Please Add Photo", 400));

  if (!name || !price || !stock || !category) {
    rm(photo.path, () => {
      //upload hone ke just bad all fields enter nhi hai to photo delete ho jayega
      console.log("Deleted");
    });

    //means fields ke all nhi rahne par bhi image add ho jata hai to use delete karne ke liye
    return next(new ErrorHandler("Please Enter all fields", 400));
  }

  await Product.create({
    name,
    price,
    stock,
    category: category.toLowerCase(),
    photo: photo?.path,
  });

   invalidateCache({product:true,admin : true})

  return res.status(201).json({
    success: true,
    message: "Product created succefully",
  });
});









export const uplateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 400));

  // if (!photo) return next(new ErrorHandler("Please Add Photo", 400));

  if (photo) {
    //photo  hai product nhi
    rm(product.photo, () => {
      //upload hone ke just bad all fields enter nhi hai to photo delete ho jayega
      console.log("Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

   invalidateCache({product:true,productId:product._id,admin : true})

  return res.status(200).json({
    success: true,
    message: "Product Update succefully",
  });
});

export const deleteProduct = TryCatch(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Found", 400));
    
    rm(product.photo , ()=>{
        console.log(`Product Photo Deleted`);        
    })

    await Product.deleteOne();

     invalidateCache({product:true,productId:String(product._id),admin : true});

    return res.status(200).json({
        success : true,
        message: `Product delete succefully ${product.name}`,
    });
});

// filter
export const getAllProducts  = TryCatch(async(req,res,next)=>{
    
    const {search,sort,category,price} = req.query

    const page = Number(req.query.page) || 1;


    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = (page-1) * limit

    const baseQuery = {};
    
    if(search){
        baseQuery.name = {
            $regex  : search,
            $options : "i"
        }
    }

    if(price){baseQuery.price ={
        $lte : Number(price),
    }}

    if(category){baseQuery.category = category;}

    const productsPromise =  Product.find(baseQuery).sort(sort && {price:sort==="asc"?1:-1}).limit(limit).skip(skip)
    

    const [products,filteredOnlyProduct] = await Promise.all([
       productsPromise,
        Product.find(baseQuery)
    ])

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit)

    return res.status(200).json({
        success : true,
        message: `Product all succefully`,
        products,totalPage
    });
})



// random product
// const generateRandomProducts = async(count) => {
//     const products = []
//     for(let i =0;i<count;i++){
//         const product = {
//             name : faker.commerce.productName(),
//             photo : "uploads\\8fa9116e-2611-4666-bc3c-8b8f5296ef9e.png",
//             price : faker.commerce.price({min:1500,max:80000,dec:0}),
//             stock : faker.number.int({min:0,max:100}),
//             category  : faker.commerce.department(),
//             createAt : new Date(faker.date.past()),
//             updatedAt:new Date(faker.date.recent()),
//             _v : 0,
//         };
//         products.push(product)
//     }
//     await Product.create(products)
//     console.log({success:true});
    
// }

// generateRandomProducts(40)

// const deleteRandomProducts = async(count)=>{
//     const products = await Product.find({}).skip(2);
//     for(let i = 0;i<products.length;i++){
//         const product = products[i]
//         await product.deleteOne();
//     }
//     console.log({success:true});    
// }

// deleteRandomProducts(38);





//NodeCache एक इन-मेमोरी कैशिंग लाइब्रेरी है, जो Node.js एप्लिकेशन में डेटा को अस्थायी रूप 
// से स्टोर करने के लिए उपयोग की जाती है। यह कैशिंग सिस्टम तब मददगार होता है जब 
// आप बार-बार एक ही डेटा को प्राप्त
//  करना या प्रोसेस करना नहीं चाहते हैं, जिससे आपके एप्लिकेशन की परफॉर्मेंस बढ़ जाती है।
//set(key, value, ttl): किसी की और वैल्यू को कैश में स्टोर करने के लिए। ttl (time-to-live) वैकल्पिक है, जो सेकंड में डेटा की लाइफटाइम सेट करता है।
// get(key): स्टोर किए गए की से वैल्यू प्राप्त करने के लिए।
// del(key): किसी खास की को कैश से हटाने के लिए।
// flushAll(): पूरे कैश को खाली करने के लिए, यानी सारे डेटा को हटा देगा।
// कैशिंग का फायदा:
// बार-बार एक ही डेटा को प्रोसेस करने की जरूरत नहीं रहती।
// API या डेटाबेस कॉल्स की संख्या को कम किया जा सकता है।
// एप्लिकेशन की परफॉर्मेंस बेहतर होती है।
// TTL (Time-to-Live) का उपयोग:
// TTL का उपयोग करके आप डेटा को एक सीमित समय के लिए स्टोर कर सकते हैं। जब वह समय सीमा पूरी हो जाती है, तो वह डेटा अपने आप कैश से हट जाता है।
