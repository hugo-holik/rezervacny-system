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
  getAllApplications,
  getColleaguesApplications,
  getApplicationsHistory,
  editApplication,
  deleteApplication,
  updateAttendeeStatus,
  togglePublished,
  removeOldEvents
} = require("../controllers/eventController");

const router = express.Router();

// applications (prihlasovanie na otvorene cvicenia)
router.post("/sendApplication/:eventId/:exerciseId", sendApplication);
router.get("/getApplications", getApplications);
router.get("/getAllApplications", getAllApplications);
router.get("/getColleaguesApplications", getColleaguesApplications);
router.get("/getApplicationsHistory", getApplicationsHistory);
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
router.delete("/old", removeOldEvents);
router.get("/:id", getEventById);
router.put("/:id", edit);
router.delete("/:id", remove);


// otvorene cvicenia
router.post("/addExercise/:id", addExcercise);
router.put("/editExercise/:eventId/:exerciseId", editExercise);
router.delete("/removeExercise/:eventId/:exerciseId", removeExercise);

// Aktualizácia stavu účastníka v cvičení
router.put(
  "/updateAttendeeStatus/:eventId/:exerciseId/:attendeeId", 
  updateAttendeeStatus);

module.exports = router;
