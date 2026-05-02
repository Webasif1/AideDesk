import { body } from 'express-validator';

export const createTicketValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .optional()
    .isIn(['billing', 'technical', 'account', 'general'])
    .withMessage('Category must be billing, technical, account, or general'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  body('source')
    .optional()
    .isIn(['chat', 'email', 'dashboard', 'api'])
    .withMessage('Source must be chat, email, dashboard, or api'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),

  body('chat')
    .optional()
    .isMongoId()
    .withMessage('Chat ID must be a valid MongoDB ObjectId')
];

export const updateTicketValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('status')
    .optional()
    .isIn(['open', 'pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be open, pending, in_progress, resolved, or closed'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  body('category')
    .optional()
    .isIn(['billing', 'technical', 'account', 'general'])
    .withMessage('Category must be billing, technical, account, or general'),

  body('assignedAgent')
    .optional()
    .isMongoId()
    .withMessage('Assigned agent must be a valid MongoDB ObjectId'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];
