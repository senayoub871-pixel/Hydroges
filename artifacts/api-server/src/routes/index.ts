import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import usersRouter from "./users";
import authRouter from "./auth";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/documents", documentsRouter);
router.use("/users", usersRouter);
router.use("/profile", profileRouter);

export default router;
