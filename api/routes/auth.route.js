import express from "express"
import { signin, signup } from "../controllers/auth.controller.js";

const route=express.Router();


route.post("/sign-up",signup)
route.post("/sign-in",signin)

export default route;