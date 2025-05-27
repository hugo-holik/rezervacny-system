const { throwError, errorFormatter } = require("../util/universal");
const { body, validationResult, matchedData } = require("express-validator");
const ExternalSchool = require("../models/externalSchool");
const { validate, validated } = require("../util/validation");
const { createExternalSchoolSchema, editExternalSchoolSchema } = require("../schemas/externalSchool.schema");

exports.get = async (req, res) => {
  try {
    const records = await ExternalSchool.find({});

    res.status(200).send(records);

  } catch (err) {
    throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const record = await ExternalSchool.findById(req.params.id);
    if (!record) {
      throwError(req.t("messages.record_not_exists"), 404);
    }

    res.status(200).send(record);

  } catch (err) {
    throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
  }
};

exports.create = [
  validate(createExternalSchoolSchema),
  async (req, res) => {
    const { 
      name, 
      address, 
      contactPerson, 
      telNumber 
    } = validated(req.body);

    const existingRecord = await ExternalSchool.findOne({ name });

    if (existingRecord) {
      throwError(req.t("validation.school_already_exist"), 400);
    }

    const newSchool = new ExternalSchool({
      name: name,
      address: address,
      contactPerson,
      telNumber,
    });

    try {
      await newSchool.save();

      res.status(201).send({});

    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
    }
  }
];

exports.edit = [
  validate(editExternalSchoolSchema),
  async (req, res) => {
    const validatedData = validated(req);

    const record = await ExternalSchool.findOne({ _id: req.params.id });
    if (!record) {
      throwError(req.t("messages.record_not_exists"), 404);
    }

    try {
      for (const key in validatedData) {
        if (validatedData[key] !== undefined) {
          record[key] = validatedData[key];
        }
      }

      await record.save();

      return res.status(200).send({});

    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  },
];

exports.remove = async (req, res) => {
  const record = await ExternalSchool.findOne({ _id: req.params.id });

  if (record) {
    try {
      await ExternalSchool.deleteOne();
      
      res.status(200).send({});

    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }

  } else {
    throwError(req.t("messages.record_not_exists"), 404);
  }
};
