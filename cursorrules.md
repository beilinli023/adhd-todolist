# AI Programming Rules for Project Directory and File Management

## Introduction

This document establishes a comprehensive set of programming rules for managing the directory and file structure of the Efficient Time Management ToDo List App. These rules ensure consistency, scalability, and maintainability across the project's lifecycle. Following these guidelines will streamline collaboration, facilitate debugging, and enhance the overall quality of the codebase.

---

## Updated Directory Structure

### Root Directory

The root directory serves as the foundation for the project and contains the following essential elements:

```
/
|-- /backend
|   |-- /config
|   |   |-- database.js
|   |   |-- firebaseConfig.json
|   |   |-- supabaseConfig.json
|   |-- /controllers
|   |   |-- taskController.js
|   |   |-- userController.js
|   |-- /models
|   |   |-- Task.js
|   |   |-- User.js
|   |-- /routes
|   |   |-- taskRoutes.js
|   |   |-- userRoutes.js
|   |-- /services
|   |   |-- taskService.js
|   |   |-- userService.js
|   |-- app.js
|   |-- server.js
|
|-- /frontend
|   |-- /src
|   |   |-- /assets
|   |   |   |-- /icons
|   |   |   |-- /images
|   |   |-- /components
|   |   |   |-- AddTaskForm
|   |   |   |   |-- index.js
|   |   |   |   |-- styles.js
|   |   |   |-- TaskList
|   |   |       |-- index.js
|   |   |       |-- styles.js
|   |   |-- /styles
|   |   |   |-- main.css
|   |   |   |-- theme.css
|   |-- /public
|   |   |-- index.html
|   |   |-- favicon.ico
|   |-- package.json
|   |-- .env
|   |-- .eslintrc.js
|   |-- .prettierrc
|
|-- /tests
|   |-- /frontend
|   |   |-- AddTaskForm.test.js
|   |   |-- TaskList.test.js
|   |-- /backend
|       |-- taskController.test.js
|       |-- userController.test.js
|
|-- /docs
|   |-- README.md
|   |-- API_Documentation.md
|
|-- .env
|-- package.json
```

### Backend Directory

- **`/config/`:** Contains configuration files such as database and Firebase settings.
- **`/controllers/`:** Houses logic for handling API requests.
- **`/models/`:** Defines data schemas for MongoDB.
- **`/routes/`:** API endpoint definitions.
- **`/services/`:** Contains reusable business logic.
- **`app.js`:** Initializes the application.
- **`server.js`:** Entry point for running the backend server.

### Frontend Directory

- **`/src/`:** Core application code for the frontend.
  - **`/assets/`:** Stores static files like icons and images.
  - **`/components/`:** Reusable React components.
  - **`/styles/`:** Shared and global styles.
- **`/public/`:** Contains static files directly served by the application.
- **`package.json`:** Manages frontend dependencies.
- **`.env`:** Frontend-specific environment variables.

### Testing Directory

- **`/tests/`:** Contains both unit and integration tests for frontend and backend components.
  - **`/frontend/`:** Tests for React components.
  - **`/backend/`:** Tests for API logic.

### Documentation Directory

- **`/docs/`:** Project documentation.
  - **`README.md`:** Overview and setup instructions.
  - **`API_Documentation.md`:** Detailed API documentation.

### Additional Notes

- **Local Deployment:** Ensure `.env` files are set up correctly for local development.
- **Future Cloud Deployment:** Maintain modularity to simplify cloud integration when transitioning.
- **File Permissions:** Restrict sensitive files (`.env`, `firebaseConfig.json`) to authorized access only.

---

## 6. Automation for Directory and File Validation

To ensure adherence to these directory and file management rules, an automated validation script has been introduced. This script performs the following checks:

### Validation Features

1. **File Path Compliance:**
   - Ensures that new files are placed in the appropriate directories based on the defined structure.

2. **Naming Conventions:**
   - Validates file names against the naming rules (e.g., camelCase for files, kebab-case for folders).

3. **Directory Classification:**
   - Verifies that files are correctly categorized (e.g., components in `/components/`, routes in `/routes/`).

### Script Implementation

A Node.js script, `validateStructure.js`, is used for these checks:

```javascript
const fs = require('fs');
const path = require('path');

const projectStructure = {
    "backend": ["config", "controllers", "models", "routes", "services", "app.js", "server.js"],
    "frontend/src": ["assets", "components", "styles", "public"],
    "tests": ["frontend", "backend"],
    "docs": ["README.md", "API_Documentation.md"]
};

const namingRegex = /^[a-z][a-zA-Z0-9]*\.js$/; // Example: camelCase.js

const checkStructure = (basePath, structure) => {
    for (const item of structure) {
        const fullPath = path.join(basePath, item);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Missing: ${fullPath}`);
            process.exit(1);
        }
    }
};

const validateNaming = (directory) => {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.lstatSync(fullPath).isFile() && !namingRegex.test(file)) {
            console.error(`❌ Naming violation: ${fullPath}`);
            process.exit(1);
        }
    }
};

const main = () => {
    console.log("Validating project structure...");

    for (const [key, value] of Object.entries(projectStructure)) {
        checkStructure(key, value);
    }

    console.log("Validating naming conventions...");
    validateNaming("frontend/src/components");

    console.log("✅ All checks passed.");
};

main();
```

### Integration with `package.json`

Add the following script to the `package.json` file:

```json
{
  "scripts": {
    "validate:structure": "node validateStructure.js"
  }
}
```

### Usage

- Run the validation script using:
  ```bash
  npm run validate:structure
  ```

- Example output:
  ```bash
  Validating project structure...
  Validating naming conventions...
  ✅ All checks passed.
  ```

---

## 7. Conclusion

These rules are designed to create a well-organized, scalable, and maintainable codebase for the Efficient Time Management ToDo List App. Adhering to these guidelines will ensure that the project remains robust, user-friendly, and capable of evolving with future needs. The addition of an automated validation script enforces compliance, reduces errors, and maintains consistency in project development.

## Code Style and Formatting

### ESLint Configuration
- 遵循 Airbnb React/JSX Style Guide
- 配置文件位置：`/frontend/.eslintrc.js`

### Prettier Configuration
- 统一的代码格式化规则
- 配置文件位置：`/frontend/.prettierrc`

### Component Development Rules
- 组件按功能和目的组织
- 可重用组件放置在共享目录
- 确保所有 UI 组件符合无障碍标准
  - 支持键盘导航
  - 兼容屏幕阅读器

