const { throwError, errorFormatter } = require("../util/universal");
const { body, validationResult, matchedData } = require("express-validator");

const Exercise = require("../models/exercise");
//const Event = require("../models/events");

// CREATE EXERCISE ========================================================
exports.create = [
  body("name").not().isEmpty().withMessage("validation.empty_name"),
  body("program").not().isEmpty().withMessage("validation.empty_program"),
  body("description")
    .not()
    .isEmpty()
    .withMessage("validation.empty_description"),
  body("leads").isArray({ min: 1 }).withMessage("validation.empty_lead"),
  body("room").not().isEmpty().withMessage("validation.empty_room"),
  body("duration").not().isEmpty().withMessage("validation.empty_duration"),
  body("startTimes")
    .isArray({ min: 1 })
    .withMessage("validation.empty_startTimes"),
  body("maxAttendees").not().isEmpty().withMessage("validation.maxAttendees"),
  body("color").optional(),

  async (req, res) => {
    throwError(
      req.t("messages.createExercise"),
      400,
      validationResult(req).formatWith(errorFormatter)
    );
    const {
      name,
      program,
      description,
      room,
      leads,
      duration,
      startTimes,
      maxAttendees,
      color,
    } = req.body;

    const existingExercise = await Exercise.findOne({ name });
    if (existingExercise) {
      throwError(req.t("validation.exercise_already_exist"), 400);
    }

    const newExercise = new Exercise({
      name,
      program,
      description,
      room,
      leads,
      duration,
      startTimes,
      maxAttendees,
      color,
    });

    try {
      await newExercise.save();
    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
    }
    res.status(201).send({});
  },
];

// GET ALL EXERCISES  ====================================================
exports.getAll = async (req, res) => {
  try {
    const records = await Exercise.find();
    res.status(200).send(records);
  } catch (err) {
    throwError(err.message, 500);
  }
};

// EDIT EXERCISE ==========================================================
exports.edit = [
  body("name").optional(),
  body("program").optional(),
  body("description").optional(),
  body("room").optional(),
  body("leads").optional(),
  body("duration").optional(),
  body("startTimes").optional(),
  body("maxAttendees").optional(),
  body("color").optional(),

  async (req, res) => {
    const matched = matchedData(req, {
      includeOptional: true,
      onlyValidData: true,
    });

    const record = await Exercise.findOne({ _id: req.params.id });
    if (!record) {
      return res.status(404).send();
    }

    try {
      for (const key in matched) {
        if (matched[key] !== undefined) {
          record[key] = matched[key];
        }
      }

      await record.save();
      return res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  },
];

// DELETE EXERCISE  =======================================================
exports.remove = async (req, res) => {
  const exerciseId = req.params.id;
  const record = await Exercise.findOne({ _id: exerciseId });
  if (record) {
    try {
      // await Event.updateMany(
      //   { openExercises: { $elemMatch: { exercise: exerciseId } } },
      //   { $pull: { openExercises: { exercise: exerciseId } } }
      // );

      await Exercise.deleteOne({ _id: exerciseId });

      res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  } else {
    throwError(req.t("messages.record_not_exists"), 404);
  }
};

