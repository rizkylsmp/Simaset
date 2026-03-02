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
  roleMiddleware("admin_bpkad", "bpkad", "admin_bpn", "bpn"),
  PusatDataController.getStats,
);

// Read - all roles can view
router.get(
  "/",
  roleMiddleware("admin_bpkad", "bpkad", "admin_bpn", "bpn"),
  PusatDataController.getAll,
);
router.get(
  "/:id",
  roleMiddleware("admin_bpkad", "bpkad", "admin_bpn", "bpn"),
  PusatDataController.getById,
);
router.post(
  "/",
  roleMiddleware("admin_bpkad", "bpkad"),
  PusatDataController.create,
);
router.put(
  "/:id",
  roleMiddleware("admin_bpkad", "bpkad"),
  PusatDataController.update,
);
router.delete(
  "/:id",
  roleMiddleware("admin_bpkad", "bpkad"),
  PusatDataController.remove,
);

export default router;
