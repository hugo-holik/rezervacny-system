import Joi from 'joi';

export const createExerciseSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters",
    }),
    program: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Program is required",
        "string.min": "Program must be at least 2 characters",
        "string.max": "Program must not exceed 100 characters",
    }),
    description: Joi.string().min(2).required().messages({
        "string.empty": "Description is required",
        "string.min": "Description must be at least 2 characters",
    }),
    room: Joi.string().min(2).required().messages({
        "string.empty": "Room is required",
        "string.min": "Room must be at least 2 characters",
    }),
    leads: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.min": "Leads must contain at least one lead",
        "array.base": "Leads must be an array of strings",
    }),
    duration: Joi.number().min(1).required().messages({
        "number.empty": "Duration is required",
        "number.min": "Duration must be at least 1 minute",
    }),
    startTimes: Joi.array().items(Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
        .message("Start time must be in HH:mm format")
        ).min(1).required().messages({
        "array.min": "Start times must contain at least one start time",
        "array.base": "Start times must be an array of strings",
    }),
    maxAttendees: Joi.number().min(1).required().messages({
        "number.empty": "Max attendees is required",
        "number.min": "Max attendees must be at least 1",
    }),
    color: Joi.string().optional().messages({
        "string.empty": "Color must be a valid string",
    }),
}).unknown(false); // Don't allow extra properties

export const updateExerciseSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
        "string.empty": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 100 characters",
    }),
    program: Joi.string().min(2).max(100).optional().messages({
        "string.empty": "Program must be at least 2 characters",
        "string.max": "Program must not exceed 100 characters",
    }),
    description: Joi.string().min(2).optional().messages({
        "string.empty": "Description must be at least 2 characters",
    }),
    room: Joi.string().min(2).optional().messages({
        "string.empty": "Room must be at least 2 characters",
    }),
    leads: Joi.array().items(Joi.string()).min(1).optional().messages({
        "array.min": "Leads must contain at least one lead",
        "array.base": "Leads must be an array of strings",
    }),
    duration: Joi.number().min(1).optional().messages({
        "number.empty": "Duration must be at least 1 minute",
    }),
        startTimes: Joi.array().items(Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
        .message("Start time must be in HH:mm format")
        ).min(1).required().messages({
        "array.min": "Start times must contain at least one start time",
        "array.base": "Start times must be an array of strings",
    }),
    maxAttendees: Joi.number().min(1).optional().messages({
        "number.empty": "Max attendees must be at least 1",
    }),
    color: Joi.string().optional().messages({
        "string.empty": "Color must be a valid string",
    }),
}).unknown(false); // Don't allow extra properties


