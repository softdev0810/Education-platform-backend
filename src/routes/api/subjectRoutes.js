const express = require("express");
const router = express.Router();

const subjectController = require("../../controllers/subjectController");
const requiredAuth = require("../../middlewares/requiredAuth");
const requiredAdmin = require("../../middlewares/requiredAdmin");

router.get("/", subjectController.test);
router.get("/all", requiredAuth, subjectController.all);
router.post("/add", requiredAuth, requiredAdmin, subjectController.addSubject);
router.delete(
  "/delete/:subject_id",
  requiredAuth,
  requiredAdmin,
  subjectController.deleteSubject
);
router.post("/addtopic/:subject_id", requiredAuth, requiredAdmin, subjectController.addTopic);

module.exports = router;
