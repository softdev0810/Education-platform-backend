const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");
const requireAuth = require("../../middlewares/requiredAuth");
const requiredAdmin = require("../../middlewares/requiredAdmin");

router.get("/", userController.test);
router.get("/me", requireAuth, userController.me);
router.get("/admin", requireAuth, requiredAdmin, userController.admin);
router.get("/all", requireAuth, requiredAdmin, userController.all);
router.put(
  "/updateadmin",
  requireAuth,
  requiredAdmin,
  userController.updateAdmin
);

module.exports = router;
