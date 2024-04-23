import express from "express"
import { google, signin, signup } from "../controllers/auth.controller.js";

const route=express.Router();


route.post("/sign-up",signup)
route.post("/sign-in",signin)
route.post("/google",google)

export default route;