import { Router } from "express";
import { listSavedItemsHandler, saveItemHandler, removeSavedItemHandler } from "../controllers/saved-items.controller";
import { validate } from "../middlewares/validate.middleware";
import { savedItemsBodySchema, savedItemsUserIdSchema, savedItemIdSchema } from "../validators/saved-items.validator";

const router = Router();

router.get("/user/:userId", validate(savedItemsUserIdSchema, "params"), listSavedItemsHandler);
router.post("/", validate(savedItemsBodySchema, "body"), saveItemHandler);
router.delete("/:id", validate(savedItemIdSchema, "params"), removeSavedItemHandler);

export default router;
