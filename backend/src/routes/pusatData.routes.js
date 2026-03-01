import { Router } from "express";
import PusatDataController from "../controllers/pusatData.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Stats - admin_bpkad and bpkad
router.get(
  "/stats",
  roleMiddleware("admin_bpkad", "bpkad"),
  PusatDataController.getStats,
);

// CRUD - admin_bpkad and bpkad
router.get(
  "/",
  roleMiddleware("admin_bpkad", "bpkad"),
  PusatDataController.getAll,
);
router.get(
  "/:id",
  roleMiddleware("admin_bpkad", "bpkad"),
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
