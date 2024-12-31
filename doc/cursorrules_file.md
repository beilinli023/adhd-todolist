# Cursor Rules for Project

## Project Overview

**Project Name:** Efficient Time Management ToDo List App

**Description:** This ToDo list application is designed for individual users, with a focus on enhancing time management and preventing distractions. The app prioritizes simplicity, ease of use, and a stress-free interface to aid users in adequately managing their daily tasks.

**Tech Stack:**

*   Frontend: React.js
*   Backend: Node.js
*   Database: MongoDB
*   Authentication: Firebase Auth
*   Cloud Storage: Supabase
*   IDE: Cursor AI

**Key Features:**

*   User authentication for secure access
*   Simple task creation and management
*   Real-time cloud synchronization for data
*   A technologically inspired user interface

## Project Structure

### Root Directory:

*   Contains main configuration files and documentation.

### /frontend:

*   Houses all frontend-related code, including components, styles, and assets.

/components:

*   **TaskList:** Displays all tasks.
*   **TaskItem:** Individual task details and actions.
*   **AddTaskForm:** UI for adding new tasks.
*   **Authentication:** Handles user login and signup interfaces.

/assets:

*   **Icons:** SVGs and other icons for UI.
*   **Images:** Any background or thematic images.

/styles:

*   **main.css:** Main stylesheet for app-wide styling.
*   **theme.css:** Includes theming and technology-inspired styles.

### /backend:

*   Contains backend-related code, including API routes and database models.

/controllers:

*   **taskController.js:** Functions for managing task logic.
*   **userController.js:** Functions for managing user authentication and profiles.

/models:

*   **Task.js:** Schema for tasks in MongoDB.
*   **User.js:** User schema leveraging Firebase Auth.

/routes:

*   **taskRoutes.js:** API routes for task operations.
*   **userRoutes.js:** API routes for user management.

### /config:

*   Environment variables and application settings stored in **config.js**.

### /tests:

*   Contains unit and integration tests for both frontend (React components) and backend (API endpoints).

## Development Guidelines

**Coding Standards:**

*   Use of ESLint for JavaScript linting.
*   Follow Airbnb React/JSX Style Guide.
*   Use Prettier for code formatting.

**Component Organization:**

*   Components should be organized by functionality and purpose.
*   Reusable components placed in a shared directory if necessary.

## Cursor IDE Integration

**Setup Instructions:**

*   Clone the repository to local machine.
*   Run `npm install` for both frontend and backend directories.
*   Use the Cursor AI IDE to open the project and get real-time code suggestions.

**Key Commands:**

*   `npm run start:frontend` to start the React frontend.
*   `npm run start:backend` to run the Node.js server.
*   Use shortcuts in Cursor IDE for code navigation and refactoring.

## Additional Context

**User Roles:**

*   Single-role use, no differentiation in user roles.

**Accessibility Considerations:**

*   Ensure all UI components meet accessibility standards, providing functional keyboard navigation and screen reader compatibility.
