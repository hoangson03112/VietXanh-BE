import express from "express";
import {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact,
} from "../controllers/contactController";

const router = express.Router();

// Public route
router.post("/", submitContact);

// Admin routes (should add auth middleware later)
router.get("/", getContacts);
router.put("/:id", markAsRead); // Cập nhật status

router.delete("/:id", deleteContact);

export default router;
