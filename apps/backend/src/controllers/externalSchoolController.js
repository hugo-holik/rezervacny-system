const { throwError, errorFormatter } = require("../util/universal");
const { body, validationResult, matchedData } = require("express-validator");

const ExternalSchool = require("../models/externalSchool");

exports.get = async (req, res) => {
  try {
    const records = await ExternalSchool.find({});
    res.status(200).send(records);
  } catch (err) {
    throwError(err.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const records = await ExternalSchool.find({ ids: req.user.user_id });
    res.status(200).send(records);
  } catch (err) {
    throwError(err.message, 500);
  }
};

exports.create = [
  body("name").not().isEmpty().withMessage("validation.empty_name"),
  body("address").not().isEmpty().withMessage("validation.empty_address"),
  body("contactPerson").optional(),
  body("telNumber").optional(),
  async (req, res) => {
    throwError(
      req.t("messages.createExternalSchool"),
      400,
      validationResult(req).formatWith(errorFormatter)
    );
    const { name, address, contactPerson, telNumber } = req.body;

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
    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
    }
    res.status(201).send({});
  },
];

exports.edit = [
  body("address").optional(),
  body("contactPerson").optional(),
  body("name").optional(),
  body("telNumber").optional(),
  async (req, res) => {
    const matched = matchedData(req, {
      includeOptional: true,
      onlyValidData: true,
    });
    const record = await ExternalSchool.findOne({ _id: req.params.id });
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
