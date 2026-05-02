# AideDesk Backend — Claude Context

## Stack
- Node.js/Express, MongoDB/Mongoose, ES Modules (`import`/`export`)
- JWT in httpOnly cookies, bcrypt password hashing
- Claude API (`@anthropic-ai/sdk`, model: `claude-opus-4-7`) with prompt caching
- Google Gmail OAuth2 for email delivery

## Three Roles
| Role | Model file | Created by |
|------|-----------|-----------|
| admin | `admin.model.js` | Self-registers |
| agent | `aget.model.js` | Admin creates (auto-password + invite email) |
| customer | `user.model.js` | Self-registers, scoped to one company |

## Multi-Tenant Rule — CRITICAL
- `companyId` is ALWAYS extracted from the JWT via `protect` middleware (`req.companyId`)
- NEVER trust `companyId` from `req.body` — always use `req.companyId`
- Every DB query for company-scoped resources must include `companyId` filter

## Auth Middleware
```js
router.use(protect);              // sets req.user, req.userId, req.role, req.companyId
router.get('/', requireRole('admin', 'agent'), handler);
```

## Error Handling Pattern
```js
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

export const handler = asyncHandler(async (req, res) => {
  throw new AppError('message', HTTP_STATUS.NOT_FOUND);
});
```

## Email Pattern — Fire-and-Forget
```js
sendEmail({...}).then(sent => {
  console.log(sent ? 'Email sent' : 'Email failed');
}); // Never await in HTTP response path
```

## AI Service (`services/ai.service.js`)
All methods use prompt caching (`cache_control: { type: 'ephemeral' }`) on system prompts.

| Method | Use | Returns |
|--------|-----|---------|
| `classifyIntent(text)` | Customer message intent | `'simple_faq'|'billing_issue'|'technical_problem'|'escalate_human'|'feedback'` |
| `scoreSentiment(text)` | Emotional state score | `1-5` (1=frustrated, 5=happy) |
| `generateEscalationBriefing({thread, sentiment, ticketTitle})` | Ticket escalation | 3-sentence string |
| `generateReplySuggestions({messages, companyName})` | Agent co-pilot | `[{tone, reply, confidence}]` |

**For customer messages**: use fire-and-forget pattern (don't block response).
**For escalation briefing**: await (agent needs it in the response).

## API Routes Summary
| Prefix | File | Description |
|--------|------|-------------|
| `/api/auth` | `routes/auth.routes.js` | Register, login, logout, verify, forgot/reset password |
| `/api/agents` | `routes/agent.routes.js` | Agent CRUD, status, password change |
| `/api/chats` | `routes/chat.routes.js` | Chat sessions, assign, status, stats |
| `/api/messages` | `routes/message.routes.js` | Send/get messages, read receipts, AI suggestions |
| `/api/tickets` | `routes/ticket.routes.js` | Ticket CRUD, assign, status, escalate |

## Ticket Endpoints
```
POST   /api/tickets                → create (AI classify async)
GET    /api/tickets                → list (role-scoped + filters)
GET    /api/tickets/stats          → admin dashboard counts
GET    /api/tickets/:id            → single + chat messages
PATCH  /api/tickets/:id            → update fields
PATCH  /api/tickets/:id/assign     → admin assigns agent
PATCH  /api/tickets/:id/status     → update status (resolvedAt/closedAt auto-set)
POST   /api/tickets/:id/escalate   → AI briefing generated (awaited)
DELETE /api/tickets/:id            → admin: hard delete; agent/customer: soft close
```

## Message Endpoints
```
POST   /api/messages                       → send (AI classify async for customer msgs)
GET    /api/messages/:chatId               → paginated history (oldest-first)
PATCH  /api/messages/:chatId/read          → mark read
GET    /api/messages/:chatId/unread-count  → unread count
POST   /api/messages/:messageId/suggest   → AI reply suggestions (direct response)
```

## Ticket Model Key Fields
- `ticketNumber`: auto-generated `TKT-<timestamp>` in pre-save hook
- `status`: `open | pending | in_progress | resolved | closed`
- `priority`: `low | medium | high | urgent`
- `category`: `billing | technical | account | general`
- `source`: `chat | email | dashboard | api`
- `intentLabel`, `sentimentScore`: set by AI service async
- `aiSummary`: 3-sentence briefing set on escalation
- `escalatedAt`, `resolvedAt`, `closedAt`, `firstResponseAt`: lifecycle timestamps

## Message Model Key Fields
- `role`: `user | agent | ai` (user = customer)
- `sender` + `senderModel`: polymorphic ref (`user` or `agent` model)
- `intentLabel`, `sentimentScore`: set by AI service after customer message
- `aiSuggestions`: `[{tone, reply, confidence}]` set by suggest endpoint

## Validator Pattern
```js
import { body } from 'express-validator';
export const myValidator = [
  body('field').notEmpty().withMessage('required'),
  body('field').isIn(['a','b']).withMessage('must be a or b'),
];
// In routes:
router.post('/', myValidator, validate, handler);
```

## Agent Password Generation
```js
const prefix = companyName.replace(/[^a-zA-Z]/g, '').substring(0, 4).padEnd(4, 'X');
const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const random = Array.from(crypto.randomBytes(5), b => charset[b % charset.length]).join('');
return prefix + random; // e.g., "TechKmP3x"
```

## JWT Signatures
- Login/Register: `{ userId, email, role, companyId }` — 5 days
- Password Reset: `{ userId, purpose: 'password-reset' }` — 15 min
- Email Verify: `{ userId, email, role }` — 7 days

## Next Up
- BullMQ queue for async AI processing (currently direct calls)
- Socket.IO integration for real-time message push
- Company routes (create company after admin registers)
- Customer auth routes (`/api/users/register`, `/api/users/login`)
- Frontend widget integration
