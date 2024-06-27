const express = require("express");
const router = express.Router();

const requiredAuth = require("../../middlewares/requiredAuth");
const rankController = require("../../controllers/rankController");

router.get("/", rankController.test);
router.get("/schoolrank", requiredAuth, rankController.rankSchool);
router.get("/studentrank", requiredAuth, rankController.rankUser);

module.exports = router;
