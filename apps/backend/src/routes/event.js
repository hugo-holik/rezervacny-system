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
  sendApplication,
  getApplications,
  editApplication,
  deleteApplication,
  updateAttendeeStatus,
  togglePublished
} = require("../controllers/eventController");

const router = express.Router();

// applications (prihlasovanie na otvorene cvicenia)
router.post("/sendApplication/:eventId/:exerciseId", sendApplication);
router.get("/getApplications", getApplications);
router.put(
  "/editApplication/:eventId/:exerciseId/:applicationId",
  editApplication
);
router.delete(
  "/deleteApplication/:eventId/:exerciseId/:applicationId",
  deleteApplication
);

// udalosti
router.put("/togglePublished/:eventId", togglePublished);
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
