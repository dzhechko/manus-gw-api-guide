# Manus Gateway

A full-stack web application that enables interaction with Manus AI through email, providing both a user-friendly web interface and a REST API for programmatic access.

## Features

### Web Interface
- **Task Submission**: Create tasks through an intuitive form interface
- **Real-time Tracking**: Monitor task progress with automatic status updates
- **Result Display**: View Manus responses with full markdown support
- **API Key Management**: Generate and manage API keys for programmatic access
- **Gmail Configuration**: Easy setup wizard for Gmail integration

### API Access
- **RESTful API**: Submit and track tasks programmatically
- **API Key Authentication**: Secure access with generated keys
- **Full CRUD Operations**: Create, read, and list tasks via API

### Email Integration
- **Automated Email Sending**: Tasks are automatically sent to Manus via Gmail
- **Response Tracking**: Unique task identifiers enable response matching
- **Push Notifications**: Instant updates via Google Pub/Sub (with polling fallback)
- **OAuth Security**: Secure Gmail access using Google OAuth 2.0

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────┐
│   Manus Gateway Server          │
│  ┌──────────┐  ┌──────────────┐ │
│  │  tRPC    │  │   Express    │ │
│  │  API     │  │   Webhook    │ │
│  └────┬─────┘  └──────┬───────┘ │
│       │               │         │
│  ┌────▼───────────────▼──────┐  │
│  │      Database (MySQL)     │  │
│  └───────────────────────────┘  │
└────────┬──────────────┬─────────┘
         │              │
         ▼              ▼
   ┌──────────┐   ┌──────────────┐
   │  Gmail   │   │  Google      │
   │   API    │   │  Pub/Sub     │
   └────┬─────┘   └──────┬───────┘
        │                │
        ▼                │
   ┌─────────┐           │
   │  Manus  │◄──────────┘
   │   AI    │
   └─────────┘
```

## Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- tRPC for type-safe API calls
- Wouter for routing

**Backend:**
- Node.js with Express
- tRPC for API layer
- Drizzle ORM with MySQL/TiDB
- Google APIs (Gmail, Pub/Sub)
- JWT for session management

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Google Cloud

Follow the detailed instructions in [SETUP.md](./SETUP.md) to:
- Create a Google Cloud project
- Enable Gmail and Pub/Sub APIs
- Configure OAuth consent screen
- Generate credentials

### 3. Configure Environment

Create a `.env` file:

```env
MANUS_EMAIL=your-manus-email@example.com
```

### 4. Initialize Database

```bash
pnpm db:push
```

### 5. Start Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:3000` and complete the Gmail authentication through the Settings page.

## API Usage

### Authentication

Include your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: manus_your_key_here" \
  https://your-domain.com/api/trpc/tasks.list
```

### Create Task

```bash
curl -X POST https://your-domain.com/api/trpc/tasks.create \
  -H "X-API-Key: manus_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyze recent AI developments"}'
```

### Get Task Status

```bash
curl "https://your-domain.com/api/trpc/tasks.get?input=%7B%22taskUuid%22%3A%22TASK-ABC123%22%7D" \
  -H "X-API-Key: manus_your_key_here"
```

## Project Structure

```
manus-gateway/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Tasks.tsx  # Task management
│   │   │   ├── ApiKeys.tsx # API key management
│   │   │   └── Settings.tsx # Gmail configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/trpc.ts    # tRPC client setup
│   │   └── App.tsx        # Main app with routing
│   └── public/            # Static assets
├── server/                # Backend application
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database helper functions
│   ├── gmail.ts           # Gmail API integration
│   ├── emailJobs.ts       # Background email processing
│   ├── webhookHandler.ts  # Pub/Sub webhook endpoint
│   ├── adminRouter.ts     # Admin procedures
│   └── _core/             # Framework infrastructure
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── SETUP.md               # Detailed setup instructions
└── README.md              # This file
```

## Development

### Run Tests

```bash
pnpm test
```

### Database Migrations

```bash
pnpm db:push  # Push schema changes
```

### Type Checking

```bash
pnpm typecheck
```

## Security

- **API Keys**: Stored as SHA-256 hashes in the database
- **OAuth Tokens**: Saved locally, never transmitted to clients
- **Session Cookies**: HTTP-only, secure, SameSite protection
- **Environment Variables**: Sensitive config kept out of code

## Troubleshooting

### Gmail Not Sending Emails

1. Verify `gmail-credentials.json` exists in project root
2. Check OAuth token is valid (re-authenticate if needed)
3. Confirm `MANUS_EMAIL` is set correctly
4. Check application logs for detailed error messages

### Push Notifications Not Working

1. Verify Pub/Sub topic and subscription are configured
2. Check webhook URL is publicly accessible
3. Confirm Gmail service account has Publisher role
4. Note: Polling fallback runs every 2 minutes regardless

### API Authentication Fails

1. Ensure `X-API-Key` header is included
2. Verify key hasn't been deleted
3. Check key format: `manus_` + 64 hex characters
4. Keys are case-sensitive

## License

MIT

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md).

For issues and questions, please open an issue on the project repository.
