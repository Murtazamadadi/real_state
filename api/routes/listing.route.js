import express from "express"
import { verifyToken } from "../utils/verifyUser.js";
import { createListing, deleteListing,updateListing,getUpdateListing } from "../controllers/listing.controller.js";

const route=express.Router();

route.post("/create",verifyToken,createListing)
route.delete("/delete/:id",verifyToken,deleteListing)
route.post("/update/:id",verifyToken,updateListing)
route.get("/get/:id",getUpdateListing)

export default route;