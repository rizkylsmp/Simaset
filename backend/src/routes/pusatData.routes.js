import { Router } from "express";
import PusatDataController from "../controllers/pusatData.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Stats - all roles can view
router.get(
  "/stats",
  roleMiddleware("admin_bpka", "bpka", "admin_bpn", "bpn"),
  PusatDataController.getStats,
);

// Read - all roles can view
router.get(
  "/",
  roleMiddleware("admin_bpka", "bpka", "admin_bpn", "bpn"),
  PusatDataController.getAll,
);
router.get(
  "/:id",
  roleMiddleware("admin_bpka", "bpka", "admin_bpn", "bpn"),
  PusatDataController.getById,
);
router.post(
  "/",
  roleMiddleware("admin_bpka", "bpka"),
  PusatDataController.create,
);
router.put(
  "/:id",
  roleMiddleware("admin_bpka", "bpka"),
  PusatDataController.update,
);
router.delete(
  "/:id",
  roleMiddleware("admin_bpka", "bpka"),
  PusatDataController.remove,
);

export default router;
