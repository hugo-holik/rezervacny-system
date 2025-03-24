const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String },
    activationHash: { type: String },
    salt: { type: String },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    name: { type: String },
    surname: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("fullName").get(function () {
  return `${this.name || ""} ${this.surname || ""}`.trim();
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
};

UserSchema.methods.checkPassword = function (password) {
  const hash_pwd = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return this.password === hash_pwd;
};

module.exports = mongoose.model("User", UserSchema);
