const express = require("express");
const router = express.Router();

const schoolController = require("../../controllers/schoolController");
const requiredAdmin = require("../../middlewares/requiredAdmin");
const requiredAuth = require("../../middlewares/requiredAuth");

router.get("/", requiredAuth, requiredAdmin, schoolController.test);
router.get("/all", schoolController.all);
router.post("/add", requiredAuth, requiredAdmin, schoolController.addSchool);
router.delete(
  "/delete/:school_id",
  requiredAuth,
  requiredAdmin,
  schoolController.deleteSchool
);

module.exports = router;
