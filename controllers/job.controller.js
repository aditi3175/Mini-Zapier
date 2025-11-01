import prisma from "../DB/db.js";

export const listJobs = async (req, res) => {
  try {
    const workflowId = Number(req.query.workflowId);
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const where = workflowId ? { workflowId } : {};
    const jobs = await prisma.Job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        workflowId: true,
        triggerId: true,
        status: true,
        attempts: true,
        createdAt: true,
        updatedAt: true,
        lastError: true,
        result: true,
      }
    });
    res.json({ jobs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list jobs" });
  }
};

export const getJob = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const job = await prisma.Job.findUnique({
      where: { id },
      select: {
        id: true,
        workflowId: true,
        triggerId: true,
        status: true,
        attempts: true,
        createdAt: true,
        updatedAt: true,
        lastError: true,
        payload: true,
        result: true,
      }
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get job" });
  }
};
