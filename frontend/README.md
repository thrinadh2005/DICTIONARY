# Dictionary Web Application

A modern, offline-ready dictionary application built with React and Express.js. This project provides word definitions, synonyms, antonyms, and includes features like favorites management, search history, and progressive web app capabilities.

## Project Overview

This dictionary app consists of two main parts:

### Frontend (React Application)
- **Framework**: React 19.2.3 with Create React App
- **Styling**: Bootstrap 5.3.8 for responsive design
- **HTTP Client**: Axios 1.13.2 for API communication
- **Testing**: Jest and React Testing Library for comprehensive testing
- **PWA Features**: Service Worker for offline functionality and app updates
- **Offline Storage**: IndexedDB for caching definitions locally

### Backend (Express Server)
- **Framework**: Express.js 5.2.1
- **CORS**: Enabled for cross-origin requests
- **HTTP Client**: Axios for external API calls
- **External APIs**:
  - DictionaryAPI.dev for word definitions
  - Datamuse API for synonyms and antonyms

## Key Features

- **Word Search**: Real-time word definition lookup with phonetic information
- **Synonyms & Antonyms**: Related words using Datamuse API
- **Favorites**: Save frequently used words for quick access
- **Search History**: Track recent searches (last 10 entries)
- **Offline Support**: Cached definitions available when offline
- **Progressive Web App**: Installable on mobile devices
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Network Status**: Real-time connectivity monitoring
- **Auto Updates**: Service worker handles app updates seamlessly

## Architecture

### Frontend Structure
```
frontend/
├── public/
│   ├── service-worker.js    # PWA service worker
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons
├── src/
│   ├── components/          # React components
│   │   ├── SearchBar.js     # Word search input
│   │   ├── WordResult.js    # Definition display
│   │   ├── Favorites.js     # Favorites management
│   │   ├── History.js       # Search history
│   │   └── NetworkStatus.js # Connectivity indicator
│   ├── hooks/
│   │   └── useApi.js        # Custom API hook
│   ├── utils/
│   │   └── dbUtils.js       # IndexedDB utilities
│   └── App.js               # Main application component
```

### Backend Structure
```
backend/
├── server.js                # Express server with API routes
├── package.json             # Dependencies and scripts
└── package-lock.json        # Lockfile for exact versions
```

## API Endpoints

### Backend Endpoints
- `GET /health` - Server health check
- `GET /api/define/:word` - Get word definition
- `GET /api/synonyms/:word` - Get word synonyms
- `GET /api/antonyms/:word` - Get word antonyms

### External APIs Used
- **DictionaryAPI.dev**: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **Datamuse**: `https://api.datamuse.com/words?rel_syn={word}` (synonyms)
- **Datamuse**: `https://api.datamuse.com/words?rel_ant={word}` (antonyms)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dictionary-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on http://localhost:5000

5. **Start the frontend application**
   ```bash
   cd frontend
   npm start
   ```
   App will open at http://localhost:3000

### Alternative: Using the start script
You can use the provided `start.bat` script (Windows) to start both frontend and backend simultaneously.

## Available Scripts

### Frontend Scripts
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

### Backend Scripts
- `npm start` - Starts the Express server

## Technologies Used

### Frontend
- **React 19.2.3**: Modern React with hooks and functional components
- **Bootstrap 5.3.8**: CSS framework for responsive design
- **Axios 1.13.2**: Promise-based HTTP client
- **Service Worker API**: For PWA and offline functionality
- **IndexedDB**: Browser-based database for offline storage
- **React Testing Library**: Component testing utilities
- **Jest**: JavaScript testing framework

### Backend
- **Express.js 5.2.1**: Web application framework for Node.js
- **CORS 2.8.5**: Cross-origin resource sharing middleware
- **Axios 1.13.2**: HTTP client for external API calls

### Development Tools
- **Create React App**: Build setup and development server
- **ESLint**: Code linting
- **Webpack**: Module bundling (via CRA)
- **Babel**: JavaScript transpilation (via CRA)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

The app can be deployed as a static site (frontend) with the backend as a separate service. The frontend build can be served from any static hosting service, while the backend requires a Node.js hosting environment.

### Build for Production
```bash
cd frontend
npm run build
```

The build artifacts will be stored in the `build/` directory, ready for deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
