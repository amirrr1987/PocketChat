# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-02-08

### Added - Phase 1.3: Real-time Updates
- **WebSocket Integration**: Real-time communication with Socket.IO
  - Socket connection with JWT authentication
  - Automatic reconnection handling
  - Connection state management
  - Token-based authentication for WebSocket
- **Real-time Messaging**: Live message updates
  - Real-time message delivery via WebSocket
  - Message broadcasting to conversation participants
  - Automatic message list updates
- **Typing Indicators**: Visual typing feedback
  - Typing indicator composable (`useTypingIndicator`)
  - Start/stop typing events
  - Display typing users in chat view
  - Auto-remove typing indicators after timeout
  - Duplicate user prevention in typing list
- **Online/Offline Status**: User presence indicators
  - Online status display in chat header
  - Last seen timestamp display
  - Real-time status updates via WebSocket
  - Initial status loading from API
  - Status indicators in conversation list
- **Chat View Separation**: Improved navigation structure
  - Separate `ChatView` component for individual conversations
  - `ChatsView` now only displays conversation list
  - Route-based navigation (`/chat/:id`)
  - Back navigation to conversation list
- **UI Enhancements**: Improved user experience
  - Auto-focus on message input after sending
  - Auto-scroll to latest messages
  - RTL/LTR text direction detection for Persian/English
  - Dynamic input direction based on content
  - Iconify icons integration (Telegram-like icons)
  - Material Design Icons (MDI) icon set
- **Composables**: Reusable Vue composables
  - `useSocket` composable for WebSocket management
  - `useTypingIndicator` composable for typing functionality
  - Local storage integration with VueUse
- **State Management**: Enhanced state handling
  - Online users tracking with Set
  - User last seen tracking with Map
  - Conversation state management
  - Message state management

### Changed
- **Routing**: Refactored route structure
  - Separated chat list and chat view routes
  - Improved route navigation flow
  - Better route parameter handling
- **Components**: Component refactoring
  - Split `ChatsView` into list-only component
  - Created dedicated `ChatView` component
  - Improved component organization
- **Icons**: Replaced Heroicons with Iconify
  - Using `@iconify/vue` for icon management
  - Material Design Icons for Telegram-like appearance
  - Consistent icon usage across application
- **Input Handling**: Enhanced input features
  - RTL/LTR direction detection
  - Auto-focus management
  - Improved typing indicator integration

### Fixed
- **Typing Indicators**: Fixed duplicate user names in typing list
- **Online Status**: Fixed initial online status loading from API
- **Focus Management**: Fixed input focus after message send
- **Route Navigation**: Fixed route parameter handling
- **VueUse Integration**: Fixed compatibility issues with VueUse composables

### Dependencies
- Added `@iconify/vue@^5.0.0` for icon management
- Added `@vueuse/core@^14.2.0` for utility composables
- Added `@vueuse/router@^14.2.0` for router utilities
- Added `socket.io-client@^4.8.3` for WebSocket client

---

## [1.2.0] - 2026-01-XX

### Added - Phase 1.2: Direct Messaging
- **Conversations List**: Display user conversations
  - Conversation list view (`ChatsView`)
  - Last message preview
  - Conversation sorting by last message
  - Participant information display
  - Conversation selection and navigation
- **Chat Interface**: Direct messaging UI
  - Message display with sender information
  - Message bubbles (sent/received styling)
  - Message timestamp display
  - Message input field
  - Send message functionality
- **Contacts View**: User discovery and chat initiation
  - User list display
  - Start conversation functionality
  - Direct conversation creation
  - Navigation to chat after creation
- **API Integration**: RESTful API client
  - Conversations API service
  - Messages API service
  - Axios-based HTTP client
  - Error handling
- **State Management**: Pinia store integration
  - Auth store for user authentication
  - User data management
  - Session management

### Changed
- **Routing**: Added conversation and chat routes
- **Layout**: Updated main layout for messaging
- **Components**: Created messaging-related components

---

## [1.1.0] - 2025-12-XX

### Added - Phase 1.1: Authentication & User Foundation
- **Authentication Pages**: User authentication UI
  - Registration page (`RegisterPage`)
  - Login page (`LoginPage`)
  - Form validation
  - Error handling and display
- **User Profile**: Profile management
  - Profile page (`ProfilePage`)
  - Profile editing
  - Display name and avatar management
- **Authentication**: Complete auth flow
  - JWT token storage in localStorage
  - Token-based API authentication
  - Protected routes with route guards
  - Automatic token refresh handling
- **API Client**: HTTP client setup
  - Axios configuration
  - Base URL configuration
  - Request/response interceptors
  - Error handling
- **Routing**: Vue Router setup
  - Route configuration
  - Route guards for authentication
  - Navigation helpers
- **State Management**: Pinia stores
  - Auth store for authentication state
  - User data management
  - Login/logout functionality
- **UI Components**: Base UI components
  - Main layout component
  - Navigation menu
  - Form components
- **Styling**: TailwindCSS integration
  - TailwindCSS configuration
  - Responsive design
  - Component styling

### Changed
- **Project Setup**: Initial Vue 3 project structure
- **Build Configuration**: Vite build setup
- **Development**: Development server configuration

---

## [1.0.0] - 2025-XX-XX

### Added
- Initial project setup
- Vue 3 with Composition API
- Vite build tool
- TypeScript configuration
- Basic project structure

[1.3.0]: https://github.com/araz-chat/chat-app/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/araz-chat/chat-app/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/araz-chat/chat-app/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/araz-chat/chat-app/releases/tag/v1.0.0
