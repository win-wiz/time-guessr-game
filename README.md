# Time Guessr Game  [https://timeguessr.online/]

Time Guessr is a historical geography guessing game where players need to guess the year and location of events based on historical photos.

## Main Features

- Guess the year and location of events based on historical photos
- Real-time scoring system that awards points based on guess accuracy
- Detailed result display including map location comparison and achievement system
- Game progress saving and recovery functionality
- Leaderboard system

## Technology Stack

- Next.js 14 (React Framework)
- TypeScript
- Tailwind CSS (Styling)
- Google Maps API (Map Display)

## Recent Updates

### Question Result Display System

We have added a detailed question result display system with the following features:

1. **Detailed Data Display**: Shows complete log data returned by the API
2. **Image Detail Information**: Displays historical event images and detailed descriptions
3. **Guess Comparison**: Clearly shows the comparison between player guesses and actual situations
4. **Map Integration**:
   - Simultaneously marks actual location and player-selected location on the map
   - Connects the two location points with a line
   - Automatically calculates and displays distance difference
5. **Achievement System**: Shows achievements and rewards earned by players

## Installation and Setup

1. Clone the repository
```bash
git clone <repository-url>
cd time-guessr-game
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file and add the necessary environment variables:
```
NEXT_PUBLIC_API_BASE_URL=<your-api-base-url>
NEXT_PUBLIC_API_KEY=<your-api-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

For Google Maps API setup, please refer to the [Google Maps Setup Guide](./docs/GOOGLE_MAPS_SETUP.md).

4. Start the development server
```bash
npm run dev
```

## Usage Flow

1. Start Game: Visit the homepage and click "Start Game"
2. Guess: View historical photos, guess the year and mark the location on the map
3. Submit: Click the submit button to submit your answer
4. View Results: The system will automatically redirect to the results page, showing detailed guess results
5. Continue Game: You can choose to continue the game or view overall results

## API Endpoints

The game uses the following main API endpoints:

- `/api/game/start` - Start new game
- `/api/game/submit` - Submit answer
- `/api/game/question-result/:questionSessionId` - Get question result
- `/api/game/result/:gameSessionId` - Get game total result

For detailed API documentation, please refer to the [Frontend API Guide](./docs/FRONTEND_API_GUIDE.md).

## Contributing

Welcome to contribute code, report issues, or suggest new features. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

[MIT](LICENSE)