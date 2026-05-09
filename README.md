# Real-time Typing Trainer

A modern, real-time typing application built with React, TypeScript, and PartyKit that enables users to practice typing while allowing others to spectate their sessions in real-time.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [License](#license)

## Overview

The Real-time Typing Trainer is a web application that combines traditional typing practice with modern real-time collaboration features. Users can create typing sessions where they practice typing while spectators watch their progress in real-time. The application provides comprehensive typing statistics, error tracking, and a clean, responsive user interface.

### Key Capabilities

- **Real-time Typing Sessions**: Create sessions where others can watch your typing in real-time
- **Spectator Mode**: Join sessions to watch others type with live updates
- **Solo Practice**: Practice typing without real-time features
- **Comprehensive Statistics**: Track WPM, accuracy, and timing metrics
- **Error Tracking**: Visual feedback for typing errors with backspace correction
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Features

### Core Functionality

- **Session Management**
  - Create new typing sessions with custom names
  - Join existing sessions as spectator or typist
  - Generate shareable session links
  - Solo practice mode for individual training

- **Real-time Collaboration**
  - Live typing updates for spectators
  - Connection status monitoring
  - Automatic reconnection on network issues
  - Session state synchronization

- **Typing Analytics**
  - Words Per Minute (WPM) calculation
  - Accuracy percentage tracking
  - Error position highlighting
  - Session timing and duration

- **User Experience**
  - Clean, modern interface with Tailwind CSS
  - Responsive design for all screen sizes
  - Real-time connection status indicators
  - Intuitive session management

### Technical Features

- **Type Safety**: Full TypeScript implementation with strict type checking
- **State Management**: React Context with useReducer for predictable state updates
- **Real-time Communication**: WebSocket-based communication via PartyKit
- **Performance Optimization**: Efficient re-rendering and state updates
- **Error Handling**: Comprehensive error handling and user feedback

## Technology Stack

### Frontend

- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe development
- **TanStack Router**: File-based routing with type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

### Backend & Real-time

- **PartyKit**: Real-time serverless platform for WebSocket connections
- **PartySocket**: WebSocket client for real-time communication

### Development Tools

- **ESLint**: Code linting with Antfu's configuration
- **Prettier**: Code formatting
- **Vitest**: Unit testing framework
- **Testing Library**: React component testing utilities

### Build & Deployment

- **Vite**: Build tooling and bundling
- **TypeScript Compiler**: Type checking and compilation
- **PartyKit Deploy**: Serverless deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Package manager: pnpm (recommended), bun, or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd typing
   ```

2. **Install dependencies**

   ```bash
   # Using pnpm
   pnpm install

   # Using bun (recommended)
   bun install

   # Using npm
   npm install
   ```

3. **Start the development servers**

   ```bash
   # Start both frontend and PartyKit server
   bun run dev:all

   # Or start them separately
   bun run dev        # Frontend on port 3000
   bun run dev:party  # PartyKit server on port 1999
   ```

4. **Open the application**
   Navigate to `http://localhost:3000` in your browser

### Environment Setup

The application automatically detects the environment:

- **Development**: Uses `localhost:1999` for PartyKit server
- **Production**: Uses `typing-trainer.oluwasetemi.partykit.dev`

No additional environment variables are required for local development.

## Usage

### Creating a Typing Session

1. **Start the application** and you'll see the session manager
2. **Enter a session name** (optional) in the "Start a Typing Session" section
3. **Click "Create Session"** to generate a new session
4. **Share the Session ID** or spectator link with others
5. **Click "Start Typing"** to begin your session

### Joining as a Spectator

1. **Enter a Session ID** in the "Watch a Session" section
2. **Click "Join as Spectator"** to watch the typing session
3. **View real-time updates** as the typist progresses

### Solo Practice

1. **Click "Start Solo Practice"** in the session manager
2. **Practice typing** without real-time features
3. **View your statistics** after completing the text

### Typing Interface

- **Type the displayed text** character by character
- **Use backspace** to correct errors (removes error markers)
- **View real-time statistics** including WPM and accuracy
- **See progress** through the text with visual indicators

## Architecture

### Frontend Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Components**: Reusable UI components with specific responsibilities
- **Hooks**: Custom hooks for business logic and state management
- **Context**: Global state management for typing sessions
- **Routes**: File-based routing with TanStack Router

### Real-time Communication

The real-time functionality is built on PartyKit's WebSocket infrastructure:

```
Client (React) ←→ PartyKit Server ←→ Other Clients
     ↓                    ↓              ↓
WebSocket          Session State    WebSocket
Connection         Management       Connection
```

### State Management

The application uses a combination of React Context and local state:

- **TypingContext**: Manages typing state (text, errors, timing)
- **RealtimeState**: Handles WebSocket connections and spectator data
- **Local State**: Component-specific state (modals, forms)

### Data Flow

1. **Session Creation**: User creates session → PartyKit room created
2. **Connection**: Clients connect via WebSocket with role (typist/spectator)
3. **Typing Updates**: Typist actions → Server → Broadcast to spectators
4. **State Sync**: All clients maintain synchronized session state

## API Reference

### PartyKit Server Events

#### Client to Server

- **TYPING_UPDATE**: Broadcast typing progress

  ```json
  {
    "type": "TYPING_UPDATE",
    "data": {
      "sourceText": "string",
      "currentIndex": "number",
      "errors": "number[]",
      "typedText": "string",
      "startTime": "number | null",
      "finished": "boolean"
    },
    "timestamp": "number"
  }
  ```

- **SESSION_END**: Signal session completion
  ```json
  {
    "type": "SESSION_END",
    "data": {},
    "timestamp": "number"
  }
  ```

#### Server to Client

- **SESSION_INIT**: Initialize typist session
- **SPECTATOR_INIT**: Initialize spectator session
- **TYPING_UPDATE**: Real-time typing progress
- **SESSION_START**: Session started notification
- **SESSION_END**: Session ended notification
- **SPECTATOR_JOIN/LEAVE**: Spectator count updates
- **CONNECTION_REJECTED**: Connection failure notification

### Custom Hooks

#### `useRealtimeTyping(options)`

Manages real-time typing functionality.

**Parameters:**

- `roomId: string` - Session identifier
- `role: 'typist' | 'spectator'` - User role
- `userId?: string` - Optional user identifier
- `enabled?: boolean` - Enable/disable connection
- `host?: string` - PartyKit server host

**Returns:**

- `realtimeState: RealtimeTypingState` - Current state
- `isConnected: boolean` - Connection status
- `connectionError: string | null` - Error information
- `connect(): void` - Manual connection
- `disconnect(): void` - Manual disconnection
- `broadcastTypingUpdate(state): void` - Send updates
- `broadcastSessionEnd(): void` - End session

#### `useTypingSession()`

Manages session creation and joining.

**Returns:**

- `createSession(name?): Session` - Create new session
- `joinSession(id): void` - Join existing session
- `getSessionUrl(id, role): string` - Generate session URL

### Utility Functions

#### Metrics Calculation

```
// Calculate Words Per Minute
calcWPM(charsTyped: number, elapsedMs: number): number;

// Calculate accuracy percentage
calcAccuracy(errors: number, total: number): number;

// Format time duration
formatTime(milliseconds: number): string;
```

## Development

### Available Scripts

```bash
# Development
bun run dev          # Start frontend development server
bun run dev:party    # Start PartyKit development server
bun run dev:all      # Start both servers concurrently

# Building
bun run build        # Build for production
bun run serve        # Preview production build

# Code Quality
bun run lint         # Run ESLint
bun run format       # Run Prettier
bun run check        # Format and lint

# Testing
bun run test         # Run unit tests

# Deployment
bun run deploy:party # Deploy PartyKit server
```

### Code Style

The project follows strict coding standards:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Antfu's configuration with React rules
- **Prettier**: Consistent code formatting
- **Naming Conventions**:
  - Files: kebab-case (`my-component.tsx`)
  - Variables: camelCase (`myVariable`)
  - Types: PascalCase (`MyInterface`)
  - Constants: UPPER_CASE (`MAX_COUNT`)

### Adding New Features

1. **Create components** in appropriate directories
2. **Add custom hooks** for business logic
3. **Update types** in relevant files
4. **Add tests** for new functionality
5. **Update documentation** as needed

## Testing

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run tests with coverage
bun run test --coverage
```

### Test Structure

Tests are located alongside the code they test:

- `src/utils/__tests__/` - Utility function tests
- Component tests can be added as `*.test.tsx` files

### Testing Utilities

The project uses:

- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **jsdom**: DOM simulation for browser APIs

## Deployment

### PartyKit Server Deployment

```bash
# Deploy to PartyKit
bun run deploy:party
```

The server will be available at: `typing-trainer.oluwasetemi.partykit.dev`

### Frontend Deployment

The frontend can be deployed to any static hosting service:

1. **Build the application**

   ```bash
   bun run build
   ```

2. **Deploy the `dist/` directory** to your hosting service

3. **Update the PartyKit host** in the code if using a custom domain

### Environment Configuration

- **Development**: Automatically uses localhost
- **Production**: Uses deployed PartyKit server
- **Custom**: Update host configuration in `useRealtimeTyping` hook

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the coding standards
4. **Add tests** for new functionality
5. **Run the test suite**
   ```bash
   bun run check
   bun run test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Code Review Process

- All changes require review
- Tests must pass
- Code must follow style guidelines
- Documentation should be updated

## Future Improvements

### Short-term Enhancements (Next 3 months)

#### User Experience

- **User Authentication**: Implement user accounts with persistent statistics
- **Session History**: Save and retrieve past typing sessions
- **Custom Text Input**: Allow users to upload or paste their own practice texts
- **Keyboard Layout Support**: Add support for different keyboard layouts (QWERTY, Dvorak, Colemak)
- **Dark Mode**: Implement theme switching with system preference detection

#### Performance & Reliability

- **Connection Resilience**: Implement exponential backoff for reconnection attempts
- **Offline Support**: Add service worker for offline typing practice
- **Performance Monitoring**: Integrate Web Vitals tracking and performance metrics
- **Error Boundaries**: Add React error boundaries for better error handling

#### Typing Features

- **Multi-language Support**: Add support for different languages and character sets
- **Typing Modes**: Implement different practice modes (timed, word count, accuracy focus)
- **Progress Tracking**: Long-term progress tracking with charts and analytics
- **Typing Tests**: Standardized typing tests with difficulty levels

### Medium-term Features (3-6 months)

#### Advanced Analytics

- **Detailed Statistics**: Character-level analysis, common error patterns
- **Performance Insights**: Identify weak areas and suggest improvements
- **Comparative Analysis**: Compare performance across different text types
- **Export Functionality**: Export statistics and progress data

#### Collaboration Features

- **Multi-typist Sessions**: Allow multiple people to type simultaneously
- **Typing Competitions**: Real-time typing competitions with leaderboards
- **Team Sessions**: Group typing sessions for teams or classrooms
- **Session Recording**: Record and replay typing sessions

#### Mobile & Accessibility

- **Mobile App**: Native mobile application for iOS and Android
- **Touch Typing Support**: Optimize for mobile keyboard input
- **Accessibility Improvements**: Screen reader support, keyboard navigation
- **Voice Commands**: Voice-activated session management

### Long-term Vision (6+ months)

#### AI-Powered Features

- **Adaptive Text Selection**: AI-curated text based on user skill level
- **Error Prediction**: Machine learning to predict and prevent common errors
- **Personalized Training**: Custom training programs based on individual weaknesses
- **Smart Suggestions**: Real-time suggestions for improving typing technique

#### Platform Expansion

- **Desktop Application**: Native desktop app with system integration
- **Browser Extension**: Chrome/Firefox extension for typing practice
- **API Platform**: Public API for third-party integrations
- **Educational Integration**: LMS integration for educational institutions

#### Advanced Real-time Features

- **Video Integration**: Optional video streaming during typing sessions
- **Screen Sharing**: Share screen content during typing sessions
- **Collaborative Editing**: Real-time collaborative text editing
- **Voice Chat**: Integrated voice communication for sessions

#### Enterprise Features

- **Team Management**: Admin dashboard for managing team typing sessions
- **Compliance Tracking**: Track typing proficiency for compliance requirements
- **Custom Branding**: White-label solution for organizations
- **Advanced Analytics**: Enterprise-level reporting and analytics

### Technical Improvements

#### Infrastructure

- **Database Integration**: Persistent storage for user data and statistics
- **CDN Implementation**: Global content delivery for better performance
- **Microservices Architecture**: Break down monolithic structure
- **Container Orchestration**: Kubernetes deployment for scalability

#### Development Experience

- **Component Library**: Extract reusable components into separate package
- **Storybook Integration**: Component documentation and testing
- **E2E Testing**: Comprehensive end-to-end testing with Playwright
- **CI/CD Pipeline**: Automated testing and deployment

#### Security & Privacy

- **Data Encryption**: End-to-end encryption for sensitive data
- **Privacy Controls**: Granular privacy settings for sessions
- **GDPR Compliance**: Full compliance with data protection regulations
- **Security Auditing**: Regular security audits and penetration testing

### Research & Innovation

#### Typing Science

- **Biomechanical Analysis**: Study of typing patterns and ergonomics
- **Cognitive Load Research**: Understanding mental aspects of typing
- **Accessibility Research**: Improving typing for users with disabilities
- **Performance Optimization**: Research into optimal typing techniques

#### Technology Exploration

- **WebAssembly Integration**: High-performance typing algorithms
- **WebRTC Implementation**: Peer-to-peer real-time communication
- **Blockchain Integration**: Decentralized session management
- **AR/VR Support**: Virtual reality typing environments

This roadmap represents a comprehensive vision for evolving the Real-time Typing Trainer into a full-featured platform that serves individual learners, educational institutions, and enterprise customers while maintaining the core simplicity and effectiveness of the current implementation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, TypeScript, and PartyKit**
