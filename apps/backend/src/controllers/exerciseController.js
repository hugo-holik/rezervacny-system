const { throwError, errorFormatter } = require("../util/universal");
const { createExerciseSchema, updateExerciseSchema } = require("../schemas/exercise.schema");
const { matchedData } = require('express-validator');
const Exercise = require("../models/exercise");
const { validate, validated } = require("../util/validation");
//const Event = require("../models/events");

exports.create = [
  validate(createExerciseSchema),
  async (req, res) => {
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
    } = validated(req);

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
  }
];

exports.getAll = async (req, res) => {
  try {
    const records = await Exercise.find().populate('leads', 'name surname');
    res.status(200).send(records);

  } catch (err) {
    throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);  
  }
};

exports.edit = [
  validate(updateExerciseSchema),
  async (req, res) => {
    const data = validated(req);
    
    const record = await Exercise.findOne({ _id: req.params.id });
    if (!record) {
      throwError(req.t("messages.record_not_exists"), 404);
    }

    Object.assign(record, data);

    try {
      await record.save();
      return res.status(200).send({});

    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  },
];

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
