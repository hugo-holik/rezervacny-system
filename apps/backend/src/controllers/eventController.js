const { throwError, errorFormatter } = require("../util/universal");
const { body, validationResult, matchedData } = require("express-validator");
const { Event, APPROVAL_STATUS_ENUM } = require("../models/event");
const Exercise = require("../models/exercise");
const User = require("../models/user");
const { validate, validated } = require("../util/validation");
const { sendApplicationSchema } = require("../schemas/event.schema");
const { buildApplicationsData } = require("../services/applicationsHelper");
const externalSchool = require("../models/externalSchool");
const exercise = require("../models/exercise");

exports.get = async (req, res) => {
  try {
    const eventRecords = await Event.find({})
    .populate({
      path: 'openExercises.exercise',
      model: Exercise,
      select: 'duration maxAttendees room'
    });
    res.status(200).send(eventRecords);
  } catch (err) {
    throwError(req.t('messages.server_error'), 500);
  }
};

exports.getEventById = async (req, res) => {
  try {
    const eventRecord = await Event.findById(req.params.id)
      .populate({
        path: 'openExercises.exercise',
        model: Exercise,
        select: 'duration maxAttendees room'
      });
    if (!eventRecord) {
      throwError(req.t('messages.event_not_found'), 404);
    }
    res.send(eventRecord);
  } catch (err) {
    throwError(req.t('messages.server_error'), 500);
  }
};

exports.create = [
  body("name").not().isEmpty().withMessage("validation.empty_name"),
  body("datefrom").not().isEmpty().withMessage("validation.empty_datefrom"),
  body("dateto").not().isEmpty().withMessage("validation.empty_dateto"),
  body("dateClosing").not().isEmpty().withMessage("validation.empty_dateClosing"),

  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { name, datefrom, dateto, dateClosing } = req.body;

    const existingEvent = await Event.findOne({ name });
    if (existingEvent) {
      return res.status(400).json({ error: req.t("validation.event_already_exist") });
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
      res.status(201).send({});
    } catch (err) {
      return res.status(500).json({ error: `${req.t("messages.database_error")}: ${err.message}` });
    }
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
      throwError(req.t('messages.event_not_found'), 404);
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
      await Event.deleteOne({ _id: req.params.id });
      res.status(200).send({});

    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }

  } else {
    throwError(req.t("messages.record_not_exists"), 404);
  }
};

exports.removeOldEvents = async (req, res) => {
  try {
    const today = new Date();
    const result = await Event.deleteMany({ dateto: { $lt: today } });

    res.status(200).json({
      message: `${result.deletedCount} udalostí bolo vymazaných.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
  }
};


// Otvorene cvicenia

exports.addExcercise = async (req, res) => {
  const { exerciseName } = req.body;

  const eventRecord = await Event.findOne({ _id: req.params.id });
  if (!eventRecord) {
    throwError(req.t('messages.event_not_found'), 404);
  }

  const existingExercise = eventRecord.openExercises.find((ex) => {
    let bodyDate = new Date(req.body.date).getTime();
    let exDate = new Date(ex.date).getTime();
    return exDate === bodyDate && ex.startTime === req.body.startTime && ex.exercise.toString() === req.body.exercise.toString();
  });

  if (existingExercise) {
    throwError(
      req.t('messages.exercise_conflict'),
      400,
      "Na daný dátum a čas už je vytvorené cvičenie."
    );
  }

  const exercise = await Exercise.findOne({ _id: req.body.exercise });
  if (!exercise) {
    return res.status(404).send();
  }

  const newExercise = {
    date: req.body.date,
    startTime: req.body.startTime,
    exerciseName,
    exercise: req.body.exercise,
    attendees: [],
    status: req.body.status || APPROVAL_STATUS_ENUM.PENDING,
    note: req.body.note || "",
  };

  eventRecord.openExercises.push(newExercise);

  try {
    await eventRecord.save();
    res.status(200).send({});
  } catch (err) {
    return res.status(500).json({ error: `${req.t("messages.database_error")}: ${err.message}` });
  }
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
      throwError(req.t('messages.event_not_found'), 404);
    }

    const exerciseRecord = eventRecord.openExercises.find(
      (exercise) => exercise._id.toString() === exerciseId
    );
    if (!exerciseRecord) {
      throwError(req.t('messages.exercise_not_found'), 404);
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
    try {
      await Event.updateOne(
        { _id: eventId },
        { $pull: { openExercises: { _id: exerciseId } } }
      );
      res.status(200).send({});
    } catch (error) {
      throwError(req.t('messages.database_error'), 500);
    }
  } else {
    throwError(req.t('messages.record_not_exists'), 404);
  }
};

exports.updateAttendeeStatus = async (req, res) => {
  const { eventId, exerciseId, attendeeId } = req.params;
  const { approvalStatus } = req.body;

  const eventRecord = await Event.findById(eventId);
  if (!eventRecord) {
    throwError(req.t('messages.event_not_found'), 404);
  };

  const exercise = eventRecord.openExercises.find(
    (ex) => ex._id.toString() === exerciseId
  );
  if (!exercise) {
    throwError(req.t('messages.exercise_not_found'), 404);
  }

  const attendee = exercise.attendees.find(
    (att) => att._id.toString() === attendeeId
  );
  if (!attendee) {
    throwError(req.t('messages.attendee_not_found'), 404);
  }

  attendee.approvalStatus = approvalStatus;
  if (approvalStatus === APPROVAL_STATUS_ENUM.APPROVED && !attendee.approvedAt) {
    attendee.approvedAt = new Date();
  }
  try {
    await eventRecord.save();
    res.status(200).send({ message: "Attendee status updated" });
  } catch (err) {
    throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
  }
};

exports.sendApplication = [
  validate(sendApplicationSchema),
  async (req, res) => {
    const { eventId, exerciseId } = req.params;
    const requestedAttendees = validated(req).numOfAttendees;

    const eventRecord = await Event.findOne({ _id: eventId });
    if (!eventRecord) {
      throwError(req.t('messages.event_not_found'), 404);
    }

    const openExerciseRecord = eventRecord.openExercises.find(
      (exercise) => exercise._id.toString() === exerciseId
    );
    if (!openExerciseRecord) {
      throwError(req.t('messages.exercise_not_found'), 404);
    }

    if (openExerciseRecord.status !== APPROVAL_STATUS_ENUM.APPROVED) {
      throwError(
        req.t('validation.exercise_not_approved'),
        404,
        "Nemôžete sa prihlásiť, cvičenie nie je schválené."
      );
    }

    const exerciseRecord = await Exercise.findOne({
      _id: openExerciseRecord.exercise.toString(),
    });
    if (!exerciseRecord) {
      throwError(req.t('messages.exercise_not_found'), 404);
    }

    const applicationAlreadyExists = openExerciseRecord.attendees
      .some(attendee => attendee.teacher.toString() === req.user.user_id.toString());
    if (applicationAlreadyExists) {
      throwError(
        req.t('validation.application_already_exists'),
        400,
        "Už ste sa prihlásili na toto cvičenie."
      );
    }

    const maxAttendees = exerciseRecord.maxAttendees;

    const totalAttendees = openExerciseRecord.attendees.reduce(
      (total, attendee) => total + attendee.numOfAttendees,
      0
    );

    if (
      requestedAttendees > maxAttendees ||
      totalAttendees + requestedAttendees > maxAttendees
    ) {
      throwError(
        req.t('validation.maximum_capacity_exceeded'),
        400,
        "Zadaný počet účastníkov prekračuje maximálnu kapacitu."
      );
    }

    const newApplication = {
      teacher: req.user.user_id,
      numOfAttendees: requestedAttendees,
      approvalStatus: APPROVAL_STATUS_ENUM.PENDING,
      createdAt: new Date(),
      approvedAt: null,
    };

    if (!openExerciseRecord.attendees) {
      openExerciseRecord.attendees = [];
    }

    openExerciseRecord.attendees.push(newApplication);

    try {
      await eventRecord.save();
      res.status(200).send({ message: "Application created" });
    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
    }
  }
];

// Get curent user's applications
exports.getApplications = async (req, res) => {
  try {
    const events = await Event.find();
    const exercises = await Exercise.find();
    const applications = await buildApplicationsData(events, exercises, {
      teacherId: req.user.user_id
    });

    res.status(200).send(applications);

  } catch (error) {
    throwError(req.t('messages.server_error'), 500);
  }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const events = await Event.find();
    const exercises = await Exercise.find();
    const applications = await buildApplicationsData(events, exercises);

    res.status(200).send(applications);

  } catch (error) {
    throwError(req.t('messages.server_error'), 500);
  }
};

// Get applications of current user's colleagues
exports.getColleaguesApplications = async (req, res) => {
  try {
    const events = await Event.find();
    const exercises = await Exercise.find();
    const colleagues = await User.find(
      { externalSchool: req.user.externalSchool });
    const colleagueIds = colleagues.map(colleague => colleague._id);
    const applications = await buildApplicationsData(events, exercises, {
      colleagueIds: colleagueIds
    });

    res.status(200).send(applications);
    
  } catch (error) {
    throwError(req.t('messages.server_error'), 500);
  }
};

// Get applications history of current user's old applications
exports.getApplicationsHistory = async (req, res) => {
  try {
    const events = await Event.find();
    const exercises = await Exercise.find();
    const dateNow = new Date();
    const applications = await buildApplicationsData(events, exercises, {
      filterFromDate: dateNow
    });

    res.status(200).send(applications);
    
  } catch (error) {
    throwError(req.t('messages.server_error'), 500);
  }
};

exports.editApplication = async (req, res) => {
  const { eventId, exerciseId, applicationId } = req.params;

  const eventRecord = await Event.findOne({ _id: eventId });
  if (!eventRecord) {
    throwError(req.t('messages.event_not_found'), 404);
  }

  const exerciseRecord = eventRecord.openExercises.id(exerciseId);
  if (!exerciseRecord) {
    throwError(req.t('messages.exercise_not_found'), 404);
  }

  const applicationRecord = exerciseRecord.attendees.id(applicationId);
  if (!applicationRecord) {
    throwError(req.t('messages.record_not_exists'), 404);
  }

  // Update numOfAttendees if provided
  if (req.body.numOfAttendees !== undefined) {
    const parsedNum = Number(req.body.numOfAttendees);
    if (isNaN(parsedNum)) {
      throwError(req.t('validation.invalid_number_of_attendees'), 400);
    }
    applicationRecord.numOfAttendees = parsedNum;
  }

  // Update approvalState if provided
  if (req.body.approvalState !== undefined) {
    applicationRecord.approvalStatus = req.body.approvalState;
  }

  // Update approvedAt if provided
  if (req.body.approvedAt !== undefined) {
    applicationRecord.approvedAt = req.body.approvedAt;
  }

  try {
    await eventRecord.save();
    res.status(200).send({});
  } catch (error) {
    throwError(req.t('messages.database_error'), 500);
  }
};


exports.deleteApplication = async (req, res) => {
  const { eventId, exerciseId, applicationId } = req.params;

  const eventRecord = await Event.findOne({ _id: eventId });
  if (!eventRecord) {
    throwError(req.t('messages.event_not_found'), 404);
  }

  const exerciseRecord = eventRecord.openExercises.find(
    (exercise) => exercise._id.toString() === exerciseId
  );

  if (!exerciseRecord) {
    throwError(req.t('messages.exercise_not_found'), 404);
  }

  const applicationIndex = exerciseRecord.attendees.findIndex(
    (application) => application._id.toString() === applicationId
  );

  if (applicationIndex === -1) {
    throwError(req.t('messages.record_not_exists'), 404);
  }

  exerciseRecord.attendees.splice(applicationIndex, 1);

  try {
    await eventRecord.save();
    res.status(200).send({});

  } catch (error) {
    throwError(req.t('messages.database_error'), 500);
  }
};

exports.togglePublished = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);

  if (!event) {
    throwError(req.t('messages.record_not_exists'), 404);
  }

  event.published = !event.published;

  try {
    await event.save();
    res.json({ success: true, published: event.published });

  } catch (err) {
    console.error(err);
    throwError(req.t('messages.database_error'), 500);
  }
};