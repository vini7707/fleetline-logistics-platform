import { Router } from "express";
import { Notification } from "../../models/index.js";
import { authenticate } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errors.js";
const router = Router();
router.use(authenticate);
router.get("/", async (req, res, next) => {
  try {
    res.json({
      data: await Notification.find({
        organizationId: req.auth!.organizationId,
        userId: req.auth!.userId,
      })
        .sort({ createdAt: -1 })
        .limit(100),
    });
  } catch (e) {
    next(e);
  }
});
router.post("/:id/read", async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.auth!.organizationId,
        userId: req.auth!.userId,
      },
      { $set: { readAt: new Date() } },
      { new: true },
    );
    if (!n)
      throw new AppError(
        404,
        "NOTIFICATION_NOT_FOUND",
        "Notification not found",
      );
    res.json({ data: n });
  } catch (e) {
    next(e);
  }
});
export default router;
