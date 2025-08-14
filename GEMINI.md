# TimeGuessr Game - Project Context for Qwen Code

## Project Overview

This is a Next.js 15-based web application implementing a geography/history guessing game called "TimeGuessr". The core gameplay involves:

1.  Presenting the user with a historical event, including an image and a description.
2.  The user must guess the location of the event on a map (using Google Maps API) and the year it occurred.
3.  The game calculates a score based on the accuracy of the location guess (distance from the actual location) and the year guess.
4.  The game consists of 5 rounds, and a final summary of the scores is displayed.

The project has recently been migrated from using Firebase for data storage to integrating with a third-party API for fetching historical events and verified locations. It uses TypeScript, Tailwind CSS for styling, and several UI components from `shadcn/ui`.

## Project Structure

-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Library:** shadcn/ui components
-   **Mapping:** Google Maps API via `@react-google-maps/api`
-   **State Management:** React hooks (`useState`, `useEffect`)
-   **Data Source:** Third-party API (configured via environment variables)

Key directories:
-   `src/app/`: Next.js App Router pages and API routes.
-   `src/components/`: Reusable UI components (e.g., game map, controls, results).
-   `src/lib/`: Utility functions and data service layer.

## Building and Running

### Prerequisites

1.  Node.js (version specified by Next.js 15, likely 18.x or 20.x)
2.  Package manager: `npm`, `yarn`, or `pnpm`. The project includes lock files for `npm` and `pnpm`.

### Environment Variables

Before running, you need to configure environment variables. Copy `.env.example` to `.env.local` and fill in the values:

-   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for the map component.
-   `NEXT_PUBLIC_API_BASE_URL`: The base URL of your third-party API for events/locations.
-   `NEXT_PUBLIC_API_KEY`: The API key for authenticating with the third-party API.

### Development Server

To start the development server, run one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This will start the Next.js development server, typically on `http://localhost:3000`. Navigate to `/game` to play the game.

### Production Build

To create a production build, run:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

To start the production server after building, run:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

### Linting

To check for linting errors, run:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## Development Conventions

-   **Component Structure:** UI components are located in `src/components/`. They are generally built using `shadcn/ui` primitives and Tailwind CSS.
-   **Data Fetching:** Data fetching logic is centralized in `src/lib/data-service.ts`. This service handles communication with the third-party API.
-   **API Routes:** Custom API routes are defined under `src/app/api/`. These typically act as proxies or wrappers around the third-party API calls defined in `data-service.ts`.
-   **Game Logic:** Game-specific utilities like score calculation and distance calculation are in `src/lib/game-utils.ts`.
-   **Styling:** Uses Tailwind CSS for styling with a dark mode configuration. Custom colors are defined in `tailwind.config.ts`.
-   **Type Safety:** TypeScript is used throughout for type safety. Data structures for events and locations are defined in `src/lib/data-service.ts`.

## Key Files

-   `src/app/game/page.tsx`: The main game page component, managing game state and rendering game components.
-   `src/lib/data-service.ts`: Central service for interacting with the third-party API for events and locations.
-   `src/components/game-map.tsx`: The interactive Google Map component where users place their location guesses.
-   `src/components/game-controls.tsx`: Component for submitting guesses and selecting the year.
-   `src/components/game-results.tsx`: Component displaying the results of a single round.
-   `src/components/game-progress.tsx`: Component showing game progress (rounds, scores).
-   `src/lib/game-utils.ts`: Utility functions for calculating scores and distances.
-   `THIRD_PARTY_API_INTEGRATION.md`: Detailed documentation on how the third-party API integration works and how to configure it.

## Third-Party API Integration

This project has migrated from Firebase to a third-party API. See `THIRD_PARTY_API_INTEGRATION.md` for detailed configuration instructions. The application expects the third-party API to provide endpoints for:

-   `GET /events?count={number}`: Fetch historical events.
-   `POST /events`: Submit a new historical event.
-   `GET /locations?count={number}`: Fetch verified geographical locations.
-   `POST /locations`: Submit a new geographical location.

All API requests are authenticated using a Bearer token, configured via `NEXT_PUBLIC_API_KEY`.

If the third-party API is unavailable, the application includes fallback mechanisms (e.g., using mock data) to ensure basic functionality.