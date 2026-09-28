# NepalAdvocate

NepalAdvocate is a React Native mobile application for connecting clients with verified legal professionals across Nepal. It includes lawyer directory search, appointment booking, case file vault management, AI legal query assistance, and bilingual support (English and Nepali).

---

## Core System Features

- **Multi-Role User Workflows**: Custom onboarding and tailored UI dashboards for **Clients** (seekers of legal services) and **Lawyers** (licensed advocates).
- **Interactive Navigation System**: Includes a 5-tab bottom navigation bar (`Home`, `Lawyers`, `AI Chat`, `Vault`, `Profile`) alongside an animated, touch-interactive floating dock (`FloatingDockNav`).
- **NepalAdvocate Animated Splash Screen**: Custom 3-layer vector SVG splash screen with dual curtain reveal and architectural gridline backdrop.
- **Underline Glassmorphic Form UI**: Login and Register screens featuring minimal underline inputs, password strength evaluation, role selection, and social login quick actions.
- **Bilingual Localization Engine**: Native in-memory translation switching between English (`EN`) and Nepali (`NE`).
- **Flexible Backend & Offline Mock Mode**: Built-in mock service fallback allowing full offline testing of authentication and dashboard workflows without requiring an active server connection.

---

## Architecture & Directory Structure

```text
NepalAdvocate/
├── sourcecode/                           # React Native (Expo / TypeScript) Application
│   ├── assets/                           # SVG icons, splash graphics, and branding assets
│   ├── src/
│   │   ├── components/                   # Core UI & widget components
│   │   │   ├── ui/                       # Modern component primitives (e.g., FloatingDockNav)
│   │   │   ├── CustomInput.tsx           # Underline minimal input field with theme support
│   │   │   ├── CustomButton.tsx          # Action buttons with loading and variant states
│   │   │   ├── RoleSelector.tsx          # Client / Lawyer switch pill
│   │   │   ├── PasswordStrengthMeter.tsx # Real-time password strength checker
│   │   │   └── ProfileHeaderCard.tsx     # Compact user profile summary widget
│   │   ├── context/                      # Auth and Localization Context Providers
│   │   ├── l10n/                         # English & Nepali translation dictionaries
│   │   ├── navigation/                   # Tab bar and stack navigation configurations
│   │   ├── screens/                      # Main screen views
│   │   │   ├── SplashScreen.tsx          # Animated vector emblem launch screen
│   │   │   ├── LoginScreen.tsx           # Underline glassmorphic sign-in screen
│   │   │   ├── RegisterScreen.tsx        # Sign-up screen with role selection
│   │   │   ├── DashboardScreen.tsx       # Main client/lawyer dashboard view
│   │   │   ├── LawyersScreen.tsx         # Advocate directory and filter screen
│   │   │   ├── AiChatScreen.tsx          # Legal assistant interface
│   │   │   ├── DocumentsScreen.tsx       # Document vault screen
│   │   │   └── ProfileScreen.tsx         # Account settings and preferences screen
│   │   ├── services/                     # Auth and dashboard API connectors
│   │   └── theme/                        # Color tokens and typography system
│   ├── App.tsx                           # Root container & navigation bootstrap
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   └── package.json                      # Project dependencies and script scripts
└── backend/                              # Node.js Express REST API & Database Services
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on a physical device, or an Android/iOS emulator

### Setup Instructions

1. **Navigate to the frontend directory**:
   ```bash
   cd sourcecode
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Launch the development server**:
   ```bash
   npx expo start
   ```

4. **Run on Target Device**:
   - Press `a` to launch on Android Emulator
   - Press `i` to launch on iOS Simulator
   - Press `w` to open in Web Browser

---

## Recent Technical Updates

- **Typography System Update**: Migrated from serif heading fonts to a high-legibility commercial sans-serif system for improved legibility across mobile displays.
- **Responsive Profile Card**: Refined layout spacing, icon alignment, and fixed-width vertical columns for email, phone, and location details in `ProfileHeaderCard`.
- **Top Header Bar Cleanup**: Redesigned `DashboardScreen` header to place navigation buttons cleanly on the left, centered title in the middle, and language toggle on the right.
- **Automated Responsiveness Audit**: Added Playwright end-to-end responsiveness tests verifying viewport fit across mobile (375x812) and desktop devices.
