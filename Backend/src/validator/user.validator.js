import { body } from 'express-validator';

// Admin adds customer — name + email only, no password (server-generated)
export const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 }).withMessage('Phone number cannot exceed 30 characters'),
];

export const loginUserValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('companyId')
    .notEmpty().withMessage('Company ID is required')
    .isMongoId().withMessage('Company ID must be a valid MongoDB ObjectId'),
];

export const forgotUserPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('companyId')
    .notEmpty().withMessage('Company ID is required')
    .isMongoId().withMessage('Company ID must be a valid MongoDB ObjectId'),
];

export const resetUserPasswordValidator = [
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 32 }).withMessage('Password must be between 8 and 32 characters')
    .matches(/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g)
    .withMessage('Password can only contain letters, numbers, and special characters'),
];

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('profileImage')
    .optional()
    .trim()
    .isURL().withMessage('Profile image must be a valid URL'),

  body('status')
    .optional()
    .isIn(['online', 'offline']).withMessage('Status must be online or offline'),
];

export const changeUserPasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 32 }).withMessage('Password must be between 8 and 32 characters')
    .matches(/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g)
    .withMessage('Password can only contain letters, numbers, and special characters'),
];
