module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return await res
        .status(401)
        .json({ msg: "No user, authorization denied." });
    } else if (req.user.role !== "admin") {
      return await res
        .status(400)
        .json({ msg: "No admin, authorization denied." });
    } else {
      await next();
    }
  } catch (error) {
    await res
      .status(500)
      .json({ msg: "Server error(Admin middleware).", error: error.message });
  }
};
