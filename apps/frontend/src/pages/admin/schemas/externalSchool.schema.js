import Joi from 'joi';

export const createExternalSchoolSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 50 characters'
    }),
    address: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 2 characters',
        'string.max': 'Address must not exceed 50 characters'
    }),
    contactPerson: Joi.string().min(2).max(50).messages({
        'string.min': 'Address must be at least 2 characters',
        'string.max': 'Address must not exceed 50 characters'
    }),
    telNumber: Joi.string().min(2).max(50).messages({
        'string.min': 'Address must be at least 2 characters',
        'string.max': 'Address must not exceed 50 characters'
    }),
});

export const editExternalSchoolSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 50 characters'
    }),
    address: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 2 characters',
        'string.max': 'Address must not exceed 50 characters'
    }),
    contactPerson: Joi.string().min(2).max(50).messages({
        'string.min': 'Address must be at least 2 characters',
        'string.max': 'Address must not exceed 50 characters'
    }),
    telNumber: Joi.string().min(2).max(50).messages({
        'string.min': 'Address must be at least 2 characters',
        'string.max': 'Address must not exceed 50 characters'
    }),
});

