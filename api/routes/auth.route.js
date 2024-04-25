import express from "express"
import { SignOut, google, signin, signup } from "../controllers/auth.controller.js";

const route=express.Router();


route.post("/sign-up",signup)
route.post("/sign-in",signin)
route.post("/google",google)
route.get("/signout",SignOut)

export default route;