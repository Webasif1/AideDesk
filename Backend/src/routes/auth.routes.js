//Create Router
import express from "express";
const router = express.Router();


// ============================================
// Import Controllers
// ============================================
import { registerController } from "../controllers/auth.controller.js";

// ============================================
// Routes
// ============================================
router.post("/register", registerController);

// ============================================
// Export Router
// ============================================
export default router;
