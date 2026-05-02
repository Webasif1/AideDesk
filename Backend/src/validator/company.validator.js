import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';

/**
 * Validation rules for registering a new company.
 * Fields are derived from companySchema in company.model.js
 *
 * Required  : name, slug, email, phone, website, size, address, country
 * Optional  : industry, branding (logo, primaryColor, secondaryColor), plan
 * Auto-set  : adminId, workSpaceId, status, timestamps  ← set server-side, not validated here
 */
export const registerCompanyValidator = [
  // ── name ────────────────────────────────────────────────────────────────────
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  // ── description ──────────────────────────────────────────────────────────────
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  // ── slug ─────────────────────────────────────────────────────────────────────
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isSlug()
    .withMessage(
      'Slug must be a valid slug (lowercase letters, numbers, hyphens)'
    )
    .isLength({ max: 100 })
    .withMessage('Slug cannot exceed 100 characters'),

  // ── email ────────────────────────────────────────────────────────────────────
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  // ── phone ────────────────────────────────────────────────────────────────────
  // Stored as String to support international formats e.g. +92-300-1234567
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-().]{7,20}$/)
    .withMessage(
      'Must be a valid phone number (7–20 digits, may include +, -, spaces, parentheses)'
    ),

  // ── website ──────────────────────────────────────────────────────────────────
  body('website')
    .trim()
    .notEmpty()
    .withMessage('Website URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Must be a valid URL (include http:// or https://)'),

  // ── industry ─────────────────────────────────────────────────────────────────
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry name cannot exceed 100 characters'),

  // ── size ─────────────────────────────────────────────────────────────────────
  body('size')
    .notEmpty()
    .withMessage('Company size is required')
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage(
      'Invalid company size. Allowed values: 1-10, 11-50, 51-200, 201-500, 500+'
    ),

  // ── address ──────────────────────────────────────────────────────────────────
  body('address').trim().notEmpty().withMessage('Address is required'),

  // ── country ──────────────────────────────────────────────────────────────────
  body('country').trim().notEmpty().withMessage('Country is required'),

  // ── branding (optional nested object) ────────────────────────────────────────
  body('branding.logo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Branding logo must be a valid URL'),

  body('branding.primaryColor')
    .optional()
    .trim()
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage(
      'Primary color must be a valid hex color code (e.g. #fff or #2563eb)'
    ),

  body('branding.secondaryColor')
    .optional()
    .trim()
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage(
      'Secondary color must be a valid hex color code (e.g. #fff or #64748b)'
    ),

  // ── plan (optional — defaults to 'free' in schema) ───────────────────────────
  body('plan')
    .optional()
    .isIn(['free', 'pro', 'enterprise'])
    .withMessage('Invalid plan. Allowed values: free, pro, enterprise'),

  // ── Run express-validator errors through the central error handler ────────────
  validate
];

/**
 * Validation rules for company login.
 * Only email and password are required — no company-specific fields needed.
 */
export const loginCompanyValidator = [
  // ── email ────────────────────────────────────────────────────────────────────
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  // ── Run express-validator errors through the central error handler ────────────
  validate
];
