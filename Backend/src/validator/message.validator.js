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

  // `attachments` is likewise not accepted from the client, for the same reason
  // as `role`: these rules only ever checked that a URL was well-formed, never
  // that it pointed at a file this user had uploaded. The controller ignores
  // the field entirely and builds attachments from the verified upload
  // pipeline, so validating it here would only imply it was honoured.
];
