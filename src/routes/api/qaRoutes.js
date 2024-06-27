const express = require("express");
const router = express.Router();

const qaController = require("../../controllers/qaController");
const requiredAdmin = require("../../middlewares/requiredAdmin");
const requiredAuth = require("../../middlewares/requiredAuth");

router.get("/", qaController.test);
router.post("/addques", requiredAuth, requiredAdmin, qaController.addQues);
router.put(
  "/updateques/:updateques_id",
  requiredAuth,
  requiredAdmin,
  qaController.updateQues
);
router.delete(
  "/deleteques/:deleteques_id",
  requiredAuth,
  requiredAdmin,
  qaController.deleteQues
);
router.get("/allquesans", requiredAuth, requiredAdmin, qaController.allQuesAns);
router.get("/stuques", requiredAuth, qaController.stuQues);
router.post("/addans/:ques_id", requiredAuth, qaController.addAns);
router.get("/stuquesans", requiredAuth, qaController.stuQuesAns);
router.post(
  "/trueans/:ques_id/:ans_id",
  requiredAuth,
  requiredAdmin,
  qaController.trueAns
);

module.exports = router;
