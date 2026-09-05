import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import vaultRouter from "./vault";
import mediaRouter from "./media";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(vaultRouter);
router.use(mediaRouter);
router.use(adminRouter);

export default router;
