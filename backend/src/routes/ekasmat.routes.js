import express from "express";
import * as EkasmatController from "../controllers/ekasmat.controller.js";

const router = express.Router();

router.get("/", EkasmatController.getAll);
router.post("/submit", EkasmatController.submit);

export default router;
