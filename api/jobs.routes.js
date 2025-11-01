import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { listJobs, getJob } from "../controllers/job.controller.js";

const router = Router();

router.get("/", authenticateToken, listJobs);
router.get("/:id", authenticateToken, getJob);

export default router;
