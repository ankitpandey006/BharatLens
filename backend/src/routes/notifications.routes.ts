import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  deleteNotificationHandler,
  getNotificationsHandler,
  getUnreadCountHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from "../controllers/notifications.controller";
import { validate } from "../middlewares/validate.middleware";
import { notificationIdSchema, notificationQuerySchema } from "../validators/notifications.validator";

const router = Router();

router.use(requireAuth);
router.get("/", validate(notificationQuerySchema, "query"), getNotificationsHandler);
router.get("/unread-count", getUnreadCountHandler);
router.patch("/:id/read", validate(notificationIdSchema, "params"), markNotificationReadHandler);
router.patch("/read-all", markAllNotificationsReadHandler);
router.delete("/:id", validate(notificationIdSchema, "params"), deleteNotificationHandler);

export default router;
