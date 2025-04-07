# Digital Journal - Emotion Tracker

A comprehensive digital journaling platform that allows users to track emotions, record personal insights, and manage memories with a focus on mental wellness.

## Features

- **Emotion Tracking**: Tag entries with emotions to monitor your emotional state over time
- **People & Places**: Tag the important people and places in your life within entries
- **Voice Recording**: Use speech-to-text to dictate your journal entries
- **Customizable Text**: Personalize your journal with different fonts, sizes, and colors
- **Secure Authentication**: Protect your personal journal with email/password authentication
- **Data Management**: Export and import your journal data for safekeeping


## Tech Stack

- Frontend: React with TypeScript
- UI Components: Shadcn UI with Tailwind CSS
- State Management: TanStack Query
- Form Handling: React Hook Form with Zod validation
- Backend: Express.js
- Database: In-memory storage (can be configured for PostgreSQL)


## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Setup

1. Clone the repository
2. Start the application through the workflow


## Project Structure

```
digital-journal/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and helpers
│   │   ├── pages/       # Page components
│   │   └── types/       # TypeScript type definitions
├── server/              # Backend Express application
│   ├── routes.ts        # API route handlers
│   └── storage.ts       # Data storage interface
└── shared/
    └── schema.ts        # Shared data schemas
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

