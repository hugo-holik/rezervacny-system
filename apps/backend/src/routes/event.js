const express = require("express");
const {
  create,
  get,
  getEventById,
  edit,
  remove,
  addExcercise,
  editExercise,
  removeExercise,
  updateAttendeeStatus,
} = require("../controllers/eventController");

const router = express.Router();

// udalosti
router.post("/", create);
router.get("/", get);
router.get("/:id", getEventById);
router.put("/:id", edit);
router.delete("/:id", remove);

// otvorene cvicenia
router.post("/addExercise/:id", addExcercise);
router.put("/editExercise/:eventId/:exerciseId", editExercise);
router.delete("/removeExercise/:eventId/:exerciseId", removeExercise);

// Aktualizácia stavu účastníka v cvičení
router.put("/updateAttendeeStatus/:eventId/:exerciseId/:attendeeId", updateAttendeeStatus);


module.exports = router;
