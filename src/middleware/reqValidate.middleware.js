export const validateReq = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        message: "Validation error",
        errors: formattedErrors,
      });
    }

    req.body = result.data;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const validateIdParam = (paramName = "id") => (req, res, next) => {
  const id = req.params[paramName];

  // Check if id exists and is a positive integer
  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) {
    return res.status(400).json({
      success: false,
      error: `${paramName} must be a positive integer`,
    });
  }

  next();
};