const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");

const User = require("../models/user");
const { validate, validated } = require("../util/validation");
const { updateUserSchema, changePasswordSchema } = require("../schemas/user.schema");

exports.SignOut = [
  async (req, res) => {
    if (req.user.user_id) {
      const loggedUser = await User.findOne({ _id: req.user.user_id });
      if (loggedUser) {
        await loggedUser.save();
        return res.status(200).send();
      } else {
        throwError(req.t("messages.singout_error"), 500);
      }
    } else {
      throwError(req.t("messages.singout_error"), 404);
    }
  },
];

exports.getCurrentUser = [
  async (req, res) => {
    if (req.user.user_id) {
      const loggedUser = await User.findById(req.user.user_id)
        .lean(); 
      return res.status(200).send(loggedUser);
    }
  },
];



exports.edit = [
  validate(updateUserSchema),
  async (req, res) => {
    const matched = validated(req);
    const user = await User.findOne({ _id: req.user.user_id });
    if (user) {
      try {
        Object.assign(user, matched);
        await user.save();
        return res
          .status(200)
          .send({ message: req.t("messages.edit_data_succes") });
      } catch (error) {
        throwError(
          `${req.t("messages.database_error")}: ${error.message}`,
          500
        );
      }
    } else {
      return res.status(404).send();
    }
  },
];


// exports.changePassword = [
//   validate(changePasswordSchema),
//   async (req, res) => {
//     const matched = validated(req);
//     const user = await User.findOne({ _id: req.user.user_id });
//     if (user) {
//       try {
//         Object.assign(user, matched);
//         await user.save();
//         return res
//           .status(200)
//           .send({ message: req.t("messages.edit_pswd_succes") });
//       } catch (error) {
//         throwError(
//           `${req.t("messages.database_error")}: ${error.message}`,
//           500
//         );
//       }
//     } else {
//       return res.status(404).send();
//     }
//   },
// ];
exports.changePassword = async (req, res) => {
  const { error } = changePasswordSchema.validate(req.body)

  if (error) {
    return res.status(430).json({
      errors: error.details.map((err) => ({
        message: err.message,
        field: err.path[0],
      })),
    })
  }

  const password = req.body.password_new

  if (req.user.user_id) {
    try {
      const user = await User.findOne({ _id: req.user.user_id })
      if (user) {
        // Verify old password first
        if (!user.verifyPassword(req.body.password_old)) {
          return res.status(430).json({
            errors: [
              {
                message: "Current password is incorrect",
                field: "password_old",
              },
            ],
          })
        }

        user.setPassword(password)
        await user.save()
        return res.status(200).send({ message: req.t("messages.password_change_success") })
      } else {
        return throwError(req.t("messages.user_not_found"), 424)
      }
    } catch (err) {
      return throwError(`${req.t("messages.database_error")}: ${err.message}`, 500)
    }
  } else {
    return throwError(req.t("messages.invalid_user"), 400)
  }
}