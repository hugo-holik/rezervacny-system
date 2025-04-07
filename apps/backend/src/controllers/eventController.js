const { throwError, errorFormatter } = require("../util/universal");
const { body, validationResult, matchedData } = require("express-validator");

const Event = require("../models/event");
const Exercise = require("../models/exercise");
const User = require("../models/user");

exports.get = async (req, res) => {
  try {
    const eventRecords = await Event.find({});
    res.status(200).send(eventRecords);
  } catch (err) {
    throwError(err.message, 500);
  }
};

exports.getEventById = async (req, res) => {
  const eventRecord = await Event.findById(req.params.id);
  if (!eventRecord) {
    return res.status(404).send();
  }
  res.send(eventRecord);
};

exports.create = [
  body("name").not().isEmpty().withMessage("validation.empty_name"),
  body("datefrom").not().isEmpty().withMessage("validation.empty_datefrom"),
  body("dateto").not().isEmpty().withMessage("validation.empty_dateto"),
  body("dateClosing")
    .not()
    .isEmpty()
    .withMessage("validation.empty_dateClosing"),

  async (req, res) => {
    throwError(
      req.t("messages.createEvent"),
      400,
      validationResult(req).formatWith(errorFormatter)
    );

    const { name, datefrom, dateto, dateClosing } = req.body;

    const existingEvent = await Event.findOne({ name });
    if (existingEvent) {
      throwError(req.t("validation.event_already_exist"), 400);
    }

    const newEvent = new Event({
      name,
      datefrom,
      dateto,
      dateClosing,
      openExercises: [],
    });

    try {
      await newEvent.save();
    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
    }
    res.status(201).send({});
  },
];

exports.edit = [
  body("name").optional(),
  body("datefrom").optional(),
  body("dateto").optional(),
  body("dateClosing").optional(),

  async (req, res) => {
    const matched = matchedData(req, {
      includeOptional: true,
      onlyValidData: true,
    });

    const eventRecord = await Event.findOne({ _id: req.params.id });
    if (!eventRecord) {
      return res.status(404).send();
    }

    try {
      for (const key in matched) {
        if (matched[key] !== undefined) {
          eventRecord[key] = matched[key];
        }
      }

      await eventRecord.save();
      return res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  },
];

exports.remove = async (req, res) => {
  const eventRecord = await Event.findOne({ _id: req.params.id });
  if (eventRecord) {
    try {
      await Event.deleteOne();
      res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  } else {
    throwError(req.t("messages.record_not_exists"), 404);
  }
};

// Otvorene cvicenia

exports.addExcercise = async (req, res) => {
    const { exerciseId, exerciseName } = req.body;
    console.log(req.body, req.params);
  
    const eventRecord = await Event.findOne({ _id: req.params.id });
    if (!eventRecord) {
      return res.status(404).send();
    }
  
    const existingExercise = eventRecord.openExercises.find((ex) => {
      let bodyDate = new Date(req.body.date).toDateString();
      console.log(bodyDate, ex.date.toDateString(), ex.name);
      return (
        ex.date.toDateString() === bodyDate &&
        ex.startTime === req.body.startTime &&
        ex.exercise.toString() === req.body._id.toString()
      );
    });
  
    if (existingExercise) {
      return res.status(400).send({ error: "Exercise conflict." });
    }
    console.log("exerciseId: ", req.body);
  
    const exercise = await Exercise.findOne({ _id: req.body.exercise._id });
    if (!exercise) {
      return res.status(404).send();
    }
  
    const defaultStatus = "čaká na schválenie";
  
    const newExercise = {
      date: req.body.date,
      startTime: req.body.startTime,
      exerciseName,
      exercise: req.body.exercise,
      attendees: [],
      status: req.body.status || defaultStatus,
      note: req.body.note || "",
    };
  
    eventRecord.openExercises.push(newExercise);
    await eventRecord.save();
    res.send({});
  };
  
  exports.editExercise = [
    body("date").optional(),
    body("startTime").optional(),
    body("exercise").optional(),
    body("status").optional(),
    body("note").optional(),
  
    async (req, res) => {
      const matched = matchedData(req, {
        includeOptional: true,
        onlyValidData: true,
      });
  
      const { eventId, exerciseId } = req.params;
  
      const eventRecord = await Event.findOne({ _id: eventId });
      if (!eventRecord) {
        return res.status(404).send();
      }
  
      const exerciseRecord = eventRecord.openExercises.find(
        (exercise) => exercise._id.toString() === exerciseId
      );
      if (!exerciseRecord) {
        return res.status(404).send();
      }
  
      try {
        for (const key in matched) {
          if (matched[key] !== undefined) {
            exerciseRecord[key] = matched[key];
          }
        }
  
        await eventRecord.save();
  
        res.status(200).send({});
      } catch (error) {
        throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
      }
    },
  ];
  
  exports.removeExercise = async (req, res) => {
    const { eventId, exerciseId } = req.params;
  
    const eventRecord = await Event.findById(eventId);
    if (eventRecord) {
      const index = eventRecord.openExercises.findIndex(
        (exercise) => exercise._id.toString() === exerciseId
      );
  
      if (index === -1) {
        return res.status(404).json({ message: "Exercise not found in event" });
      } else {
        try {
          eventRecord.openExercises.splice(index, 1);
          await eventRecord.save();
          res.status(200).send({});
        } catch (error) {
          console.error("Error removing exercise:", error);
          throwError(
            `${req.t("messages.database_error")}: ${error.message}`,
            500
          );
        }
      }
    } else {
      throwError(req.t("messages.record_not_exists"), 404);
    }
  };