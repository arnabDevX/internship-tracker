const { prisma } = require("../config/db");

// CREATE APPLICATION
exports.createApplication = async (req, res) => {
  try {
    const {
      companyName,
      company,
      role,
      jobType,
      status,
      appliedDate,
      date,
      deadline,
      location,
      salary,
      jobLink,
      notes,
      priority
    } = req.body;

    const finalCompany = companyName || company;
    const finalDate = appliedDate || date;
    if (!finalCompany || !role || !finalDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const application = await prisma.application.create({
      data: {
        companyName: finalCompany,
        role,
        jobType: jobType || "INTERNSHIP",
        status,
        appliedDate: new Date(finalDate),
        deadline: deadline ? new Date(deadline) : null,
        location,
        salary,
        jobLink,
        notes,
        priority,
        userId: req.user.id
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create application" });
  }
};

// GET ALL APPLICATIONS (with filters)
exports.getApplications = async (req, res) => {
  try {
    const { status, jobType, priority, search } = req.query;

    let filters = { userId: req.user.id };

    if (status) filters.status = status;
    if (jobType) filters.jobType = jobType;
    if (priority) filters.priority = priority;

    if (search) {
      filters.OR = [
        { companyName: { contains: search } },
        { role: { contains: search } }
      ];
    }

    const applications = await prisma.application.findMany({
      where: filters,
      orderBy: { createdAt: "desc" }
    });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// UPDATE APPLICATION
exports.updateApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.application.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...req.body,
        appliedDate: req.body.appliedDate ? new Date(req.body.appliedDate) : existing.appliedDate,
        deadline: req.body.deadline ? new Date(req.body.deadline) : existing.deadline
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update application" });
  }
};

// DELETE APPLICATION
exports.deleteApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.application.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    await prisma.application.delete({ where: { id } });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete application" });
  }
};