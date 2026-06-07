import { Router } from "express";
import { listNotifications, markRead, removeNotification } from "../controllers/notification.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateRequest);

router.get("/", listNotifications);
router.patch("/read", markRead);          // mark all read
router.patch("/:id/read", markRead);      // mark one read
router.delete("/:id", removeNotification);

export default router;
