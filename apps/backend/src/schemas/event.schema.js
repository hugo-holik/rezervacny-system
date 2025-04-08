const Joi = require("joi");

const createEventSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters",
    }),
    datefrom: Joi.date().required().messages({
        "date.base": "Date from must be a valid date",
        "any.required": "Date from is required"
    }),
    dateto: Joi.date().required().greater(Joi.ref('datefrom')).messages({
        "date.base": "Date to must be a valid date",
        "date.greater": "Date to must be after Date from",
        "any.required": "Date to is required"
    }),
    dateClosing: Joi.date().required().less(Joi.ref('dateto')).messages({
        "date.base": "Date closing must be a valid date",
        "date.less": "Closing date must be before Date to",
        "any.required": "Date closing is required"
    }),
    openExercises: Joi.array().items(
        Joi.object({
            exerciseId: Joi.string().required().messages({
                "string.empty": "Exercise ID is required",
            }),
            attendees: Joi.array().items(Joi.string()).messages({
                "array.base": "Attendees must be an array of strings"
            })
        })
    ).optional()
}).unknown(false); // Disallow unknown keys

const editEventSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters",
    }),
    datefrom: Joi.date().optional().messages({
        "date.base": "Date from must be a valid date",
    }),
    dateto: Joi.date().optional().messages({
        "date.base": "Date to must be a valid date",
    }),
    dateClosing: Joi.date().optional().messages({
        "date.base": "Date closing must be a valid date",
    }),
    openExercises: Joi.array().items(
        Joi.object({
            exerciseId: Joi.string().required().messages({
                "string.empty": "Exercise ID is required",
            }),
            attendees: Joi.array().items(Joi.string()).messages({
                "array.base": "Attendees must be an array of strings"
            })
        })
    ).optional()
}).unknown(false); // Disallow unknown keys

module.exports = {
    createEventSchema,
    editEventSchema,
};
