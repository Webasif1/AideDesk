import { body } from 'express-validator';

export const sendMessageValidator = [
  body('chat')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Chat ID must be a valid MongoDB ObjectId'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message cannot exceed 5000 characters'),

  // `role` is deliberately not accepted from the client. The controller derives it
  // from the authenticated req.role, so a caller cannot post as 'ai' or as an agent.

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*.url')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be a valid URL'),

  body('attachments.*.filename')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Attachment filename is required'),

  body('attachments.*.mimetype')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Attachment mimetype is required')
];
