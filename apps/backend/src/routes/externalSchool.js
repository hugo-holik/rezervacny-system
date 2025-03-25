const express = require("express");
const {
  create,
  get,
  getById,
  remove,
  edit,
} = require("../controllers/externalSchoolController");
const router = express.Router();

router.get("/", get);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", edit);
router.delete("/:id", remove);

module.exports = router;
