const Joi = require("joi");

const createEventSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters",
    }),
    datefrom: Joi.date().iso().required().messages({
        "date.base": "Date from must be a valid date",
        "any.required": "Date from is required"
    }),
    dateto: Joi.date().iso().required().greater(Joi.ref('datefrom')).messages({
        "date.base": "Date to must be a valid date",
        "date.greater": "Date to must be after Date from",
        "any.required": "Date to is required"
    }),
    dateClosing: Joi.date().iso().required().less(Joi.ref('dateto')).messages({
        "date.base": "Date closing must be a valid date",
        "date.less": "Closing date must be before Date to",
        "any.required": "Date closing is required"
    }),
    openExercises: Joi.array().items(
        Joi.object({
            exercise: Joi.string().required().messages({
                "string.empty": "Exercise ID is required",
            }),
            attendees: Joi.array().optional().messages({
                "array.base": "Attendees must be an array"
            })
        })
    ).optional(),
    approvalStatus: Joi.string().valid('čaká na schválenie', 'schválené', 'zamietnuté').optional().messages({
        "any.only": "Approval status must be one of: 'čaká na schválenie', 'schválené', or 'zamietnuté'"
    })
}).unknown(false); // Disallow unknown keys

const editEventSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters",
    }),
    datefrom: Joi.date().iso().optional().messages({
        "date.base": "Date from must be a valid date",
    }),
    dateto: Joi.date().iso().optional().messages({
        "date.base": "Date to must be a valid date",
    }),
    dateClosing: Joi.date().iso().optional().messages({
        "date.base": "Date closing must be a valid date",
    }),
    openExercises: Joi.array().items(
        Joi.object({
            exercise: Joi.string().required().messages({
                "string.empty": "Exercise ID is required",
            }),
            attendees: Joi.array().optional().messages({
                "array.base": "Attendees must be an array"
            })
        })
    ).optional()
}).unknown(false); // Disallow unknown keys

const sendApplicationSchema = Joi.object({
    numOfAttendees: Joi.number().required().messages({
        "number.empty": "numOfAttendees is required"
    })
}).unknown(false); // Disallow unknown keys

const updateExerciseInEventSchema = Joi.object({
  date: Joi.date().iso().optional().messages({
    'date.base': 'Date must be a valid ISO format (YYYY-MM-DD)',
    'date.format': 'Invalid date format. Use YYYY-MM-DD'
  }),
  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/) // HH:MM format
    .optional()
    .messages({
      'string.pattern.base': 'startTime must be in HH:MM format'
    }),
  exercise: Joi.string().optional(),
  exerciseName: Joi.string().optional(),
  status: Joi.string().optional(),
// status: Joi.string().valid('pending', 'completed', 'cancelled').optional().messages({
//  'any.only': 'Status must be one of: pending, completed, cancelled'
// }),
  note: Joi.string().max(500).optional().messages({
    'string.max': 'Note cannot exceed 500 characters'
  })
}).options({ abortEarly: false }); // Show all validation errors at once

module.exports = {
    createEventSchema,
    editEventSchema,
    sendApplicationSchema,
    updateExerciseInEventSchema
};
