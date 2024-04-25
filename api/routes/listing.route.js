import express from "express"
import { verifyToken } from "../utils/verifyUser.js";
import { createListing } from "../controllers/listing.controller.js";

const route=express.Router();


route.post("/create",verifyToken,createListing)
export default route;