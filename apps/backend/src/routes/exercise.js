const express = require("express");
const {
  create,
  getAll,
  edit,
  remove,
} = require("../controllers/exerciseController");
const router = express.Router();

router.get("/", getAll);
router.post("/", create);
router.put("/:id", edit);
router.delete("/:id", remove);

module.exports = router;