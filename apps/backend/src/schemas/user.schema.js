const Joi = require("joi");

const createUserShema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
  }),
  surname: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Surname is required",
    "string.min": "Surname must be at least 2 characters",
    "string.max": "Surname must not exceed 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  isAdmin: Joi.boolean().required().messages({
    "boolean.base": "isAdmin must be a boolean value",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
  }),
  passwordConfirmation: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Password confirmation does not match password",
      "string.empty": "Password confirmation is required",
    }),
}).unknown(false);

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
  }),
  surname: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Surname is required",
    "string.min": "Surname must be at least 2 characters",
    "string.max": "Surname must not exceed 50 characters",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Email must be a valid email address",
    }),
  isAdmin: Joi.boolean().required().messages({
    "boolean.base": "isAdmin must be a boolean value",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean value",
  }),
});

module.exports = {
  createUserShema,
  updateUserSchema,
};
