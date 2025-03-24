const mongoose = require("mongoose");

const ExternalSchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactPerson: { type: String },
    telNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExternalSchool", ExternalSchoolSchema);