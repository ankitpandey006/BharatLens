import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  checkSavedItemHandler,
  listSavedItemsHandler,
  removeSavedItemByItemHandler,
  removeSavedItemHandler,
  saveItemHandler,
} from "../controllers/saved-items.controller";
import { savedItemCheckSchema, savedItemIdSchema, savedItemsBodySchema } from "../validators/saved-items.validator";

const router = Router();

router.use(requireAuth);
router.get("/", listSavedItemsHandler);
router.post("/", validate(savedItemsBodySchema, "body"), saveItemHandler);
router.delete("/item/:itemType/:itemId", validate(savedItemCheckSchema, "params"), removeSavedItemByItemHandler);
router.delete("/:id", validate(savedItemIdSchema, "params"), removeSavedItemHandler);
router.get("/:itemType/:itemId/check", validate(savedItemCheckSchema, "params"), checkSavedItemHandler);

export default router;
