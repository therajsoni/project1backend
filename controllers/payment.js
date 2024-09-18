import { stripe } from "../app.js";
import { TryCatch } from "../middleware/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";


export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const {  amount } = req.body;

  if ( !amount) {
    return next(new ErrorHandler("Please enter  amount", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount : 343,
    currency : "Ind"
  })

  return res.status(201).json({
    success: true,
   
  });
});



export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount) {
    return next(new ErrorHandler("Please enter both coupon and amount", 400));
  }

  const couponCurrent = await Coupon.create({
    coupon,
    amount,
  });

  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} Created Successfully`,
    couponCurrent
  });
});


export const applyDiscount = TryCatch(async(req,res,next)=>{
    const { coupon} = req.body;
    const discount = await Coupon.findOne({code:coupon})
    if(!discount)return next(new ErrorHandler("Invalid Coupon Code",400));

    return res.status(201).json({
        success:true,
        discount : discount.amount,
        discount
    })
})

export const allCoupons = TryCatch(async(req,res,next)=>{
  
    const discount = await Coupon.findOne({})
    if(!discount)return next(new ErrorHandler("Invalid Coupon Code",400));

    return res.status(201).json({
        success:true,
        discount : discount.amount,
        discount
    })
})

export const deleteCoupon = TryCatch(async(req,res,next)=>{
    const {id} = req.params;
    const coupon = await Coupon.findById(id)
    if(!coupon)return next(new ErrorHandler("Invalid Coupon Code",400));
  
    await Coupon.findByIdAndDelete(id);

    return res.status(201).json({
        success:true,
        message : `Coupon ${coupon?.code} Deleted Successfully`,
    })
})