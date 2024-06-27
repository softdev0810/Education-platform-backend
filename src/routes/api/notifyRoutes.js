const express = require("express");
const router = express.Router();

const notifyController = require("../../controllers/notifyController");
const requiredAuth = require("../../middlewares/requiredAuth");
const requiredAdmin = require("../../middlewares/requiredAdmin");

router.get("/", notifyController.test);
router.post(
  "/addnotify",
  requiredAuth,
  requiredAdmin,
  notifyController.addNotify
);
router.delete(
  "/admindeletenotify/:notify_id",
  requiredAuth,
  requiredAdmin,
  notifyController.adminDeleteNotify
);
router.get(
  "/allnotifys",
  requiredAuth,
  requiredAdmin,
  notifyController.allNotifys
);
router.delete(
    "/studeletenotify/:stunotify_id",
    requiredAuth,
    notifyController.stuDeleteNotify
  );

module.exports = router;
