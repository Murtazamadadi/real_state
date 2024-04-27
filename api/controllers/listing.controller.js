import Listing from "../models/listing.model.js"
import { errorHandler } from "../utils/customError.js"

export const createListing= async (req,res,next)=>{
    try{
        const listing= await Listing.create(req.body)
        return res.status(201).json(listing)
    }catch(error){
        next(error)
    }
}


export const deleteListing= async(req,res,next)=>{
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'لیستی پیدا نشد'));
    }
  
    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'شما فقد میتوانید اکوانت خودتان را حذف کنید'));
    }
  
    try {
      await Listing.findByIdAndDelete(req.params.id);
      res.status(200).json('کاربر موفقانه حذف شد');
    } catch (error) {
      next(error);
    }
}


export const updateListing=async(req,res,next)=>{
    const listing= await Listing.findById(req.params.id)

    if(!listing){
        return next(errorHandler(404,"لیست پیدا نشد"))
    }

    if(req.user.id!== req.params.id){
        return next(errorHandler(401,"شما فقد میتوانید اکوانت خویش را بروزرسانی کنید"))
    }

    try{
        const updateListing=await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        res.status(200).json(updateListing)
    }catch(error){
        next(error)
    }
}