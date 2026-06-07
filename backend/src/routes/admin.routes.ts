import { Router } from "express";
import { getAdminStats, getUsers, updateUserRole, banUser } from "../controllers/admin.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateRequest);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/ban", banUser);

export default router;
