const { throwError, errorFormatter } = require("../util/universal");
const { createExerciseSchema, updateExerciseSchema } = require("../schemas/exercise.schema");
const { matchedData } = require('express-validator');
const Exercise = require("../models/exercise");
//const Event = require("../models/events");

// CREATE EXERCISE ========================================================
exports.create = async (req, res) => {
  try {
    // Validate the incoming data
    const { error } = createExerciseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message),
      });
    }

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
      return res.status(400).json({ message: req.t("validation.exercise_already_exist") });
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
      res.status(201).send({});
    } catch (err) {
      return res.status(500).json({ message: `${req.t("messages.database_error")}: ${err.message}` });
    }
  } catch (err) {
    return res.status(500).json({ message: `${req.t("messages.database_error")}: ${err.message}` });
  }
};

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
exports.edit = async (req, res) => {
  try {
    // Validate the incoming data
    const { error } = updateExerciseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message),
      });
    }

    const matched = matchedData(req, {
      includeOptional: true,
      onlyValidData: true,
    });
    console.log("Matched Data:", matched); // Log the matched data
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
  } catch (err) {
    return res.status(500).json({ message: `${req.t("messages.database_error")}: ${err.message}` });
  }
};

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
