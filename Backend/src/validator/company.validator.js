import { body } from 'express-validator';

export const createCompanyValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isSlug()
    .withMessage(
      'Slug must contain only lowercase letters, numbers, and hyphens'
    )
    .isLength({ max: 60 })
    .withMessage('Slug cannot exceed 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Company email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9\s\-().]{7,20}$/)
    .withMessage('Must be a valid phone number'),

  body('website')
    .trim()
    .notEmpty()
    .withMessage('Website URL is required')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL starting with http or https'),

  body('size')
    .notEmpty()
    .withMessage('Company size is required')
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage('Size must be one of: 1-10, 11-50, 51-200, 201-500, 500+'),

  body('address').trim().notEmpty().withMessage('Address is required'),

  body('country').trim().notEmpty().withMessage('Country is required'),

  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry cannot exceed 100 characters'),

  body('workSpaceId')
    .notEmpty()
    .withMessage('Workspace ID is required')
    .isMongoId()
    .withMessage('Workspace ID must be a valid MongoDB ObjectId')
];

export const updateCompanyValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-().]{7,20}$/)
    .withMessage('Must be a valid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL starting with http or https'),

  body('size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage('Size must be one of: 1-10, 11-50, 51-200, 201-500, 500+'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be active, inactive, or suspended'),

  body('branding.primaryColor')
    .optional()
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage('Primary color must be a valid hex color (e.g. #2563eb)'),

  body('branding.secondaryColor')
    .optional()
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage('Secondary color must be a valid hex color')
];
