import { Router } from "express";
import { getNotificationsHandler, markNotificationReadHandler } from "../controllers/notifications.controller";
import { validate } from "../middlewares/validate.middleware";
import { notificationUserIdSchema, notificationIdSchema } from "../validators/notifications.validator";

const router = Router();

router.get("/user/:userId", validate(notificationUserIdSchema, "params"), getNotificationsHandler);
router.patch("/read/:notificationId", validate(notificationIdSchema, "params"), markNotificationReadHandler);

export default router;
