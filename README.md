# NepalAdvocate

NepalAdvocate is a modern mobile platform connecting clients with legal professionals across Nepal. The application offers lawyer booking, consultation scheduling, legal document management, and bilingual support (English and Nepali).

---

## Key Features

- **Dual User Roles**: Seamless onboarding and dedicated interfaces for **Clients** (Legal Seekers) and **Lawyers** (Advocates).
- **Redesigned Mobile Interface**: Built with React Native & Expo, featuring glassmorphism UI elements, dark mode theme, and smooth interactive controls.
- **Bilingual Localization**: Built-in support for English (`EN`) and Nepali (`NE`).
- **Secure Authentication**: JWT-based login and registration with validation, password security toggles, and role assignment.
- **Legal Hub**: Access to appointment scheduling, direct messaging, contract reviews, and AI legal assistant features.

---

## Project Structure

```text
NepalAdvocate/
├── sourcecode/          # React Native (Expo) Mobile Application
│   ├── src/
│   │   ├── components/  # Reusable UI elements (CustomInput, CustomButton, RoleSelector, etc.)
│   │   ├── context/     # Auth & Localization state management
│   │   ├── l10n/        # English & Nepali translation dictionaries
│   │   ├── screens/     # Login, Register, and Dashboard screens
│   │   ├── services/    # API connectors for backend authentication
│   │   └── theme/       # Color tokens and design parameters
│   ├── App.tsx          # Root application component
│   └── package.json
└── backend/             # Node.js Express REST API & Database Services
```

---

## Getting Started

### React Native App Setup

1. Navigate to the sourcecode directory:
   ```bash
   cd sourcecode
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Run on an emulator or physical device using Expo Go:
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Press `w` for Web Preview
