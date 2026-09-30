# NepalAdvocate

NepalAdvocate is a modern mobile and cloud platform engineered to digitize and democratize legal access across Nepal. It bridges the gap between public legal seekers and verified legal practitioners, providing lawyer directory discovery, consultation appointment booking with local digital wallets (eSewa & Khalti), an encrypted legal document vault, an AI legal query assistant grounded in statutory codes, federated Google One-Tap authentication, and comprehensive bilingual support (English and Nepali Devanagari).

---

## Key Features & Capabilities

- **Federated & Multi-Role Authentication**: 
  - Standard email/password registration with real-time password entropy scoring (4-tier strength bar).
  - **Google One-Tap OAuth 2.0**: Single-click federated sign-in with embedded role designation (**Client** / **Advocate**).
  - Minimal underline glassmorphic input styling with animated focus transitions and keyboard-avoiding viewport handling.
- **Verified Lawyer Directory**:
  - Filterable by legal specialization (Corporate & Tax, Property & Civil, Criminal & Family, Constitutional).
  - Profile cards featuring Nepal Bar Council license badges (`NBA-XXXX`), consultation rates (NPR/hr), client ratings, and office locations.
- **Consultation Booking & Digital Wallets**:
  - Interactive calendar date and slot selector with case topic briefing.
  - Automatic **13% statutory VAT** calculation and unique booking reference generation (`APT-XXXXXX`).
  - Integrated digital payment simulation for **eSewa** (Green badge) and **Khalti** (Purple badge).
- **Encrypted Legal Document Vault**:
  - Personal document management for legal drafts (*Warisnama*, commercial leases, citizenship scans, tax affidavits).
  - Instant PDF metadata preview modals with verified legal security seals and simulated encrypted download hooks.
- **AI Legal Assistant (RAG Engine)**:
  - Natural language statutory retrieval grounded in the *Constitution of Nepal 2072*, *Muluki Civil & Criminal Codes 2074*, and *Companies Act 2063*.
  - Enforces mandatory non-liability legal disclaimers and provides one-click advocate referral recommendations.
- **Bilingual Localization (English & Devanagari)**:
  - Centralized in-memory translation dictionary (`translations.ts`) covering 120+ legal strings.
  - Pinned language toggle for real-time app-wide UI translation without application restarts.
- **Interactive Navigation & Animated Splash**:
  - 5-Tab persistent navigation bar (`Home`, `Lawyers`, `AI Chat`, `Vault`, `Profile`) paired with an interactive macOS-style floating dock (`FloatingDockNav`).
  - 3-layer vector SVG splash screen with scale-in emblem animation and dual curtain reveal transition.
- **Zero-Dependency Backend with Offline Fallback**:
  - Modular Express TypeScript REST API backed by an atomic file-backed JSON database (`backend/data/database.json`).
  - Seamless offline mock fallback across mobile services: the application automatically switches to local storage authentication and mock responses if the backend server is unreachable.

---

## Repository Structure

```text
NepalAdvocate/
├── sourcecode/                           # React Native (Expo / TypeScript) Mobile Frontend
│   ├── assets/                           # Branding icons, vector logos, and splash assets
│   ├── src/
│   │   ├── components/                   # Reusable UI widgets and dialogs
│   │   │   ├── ui/                       # Design primitives (FloatingDockNav, etc.)
│   │   │   ├── CustomInput.tsx           # Underline glassmorphic input with animated focus
│   │   │   ├── CustomButton.tsx          # Multi-variant action button with loading states
│   │   │   ├── RoleSelector.tsx          # Client vs Advocate spring animated toggle pill
│   │   │   ├── PasswordStrengthMeter.tsx # Real-time entropy evaluator with dynamic bar
│   │   │   ├── GoogleAuthModal.tsx       # Google One-Tap account chooser with role picker
│   │   │   ├── SocialButtons.tsx         # Google, Apple, and Facebook social buttons
│   │   │   ├── BookAppointmentModal.tsx  # Consultation booking modal with 13% VAT & wallets
│   │   │   └── ProfileHeaderCard.tsx     # Compact user profile summary widget
│   │   ├── context/                      # AuthContext (session/role) & ThemeContext (tokens)
│   │   ├── l10n/                         # Bilingual dictionary (English & Nepali Devanagari)
│   │   ├── navigation/                   # 5-Tab main application navigator
│   │   ├── screens/                      # Presentation screens
│   │   │   ├── SplashScreen.tsx          # Animated vector launch choreography
│   │   │   ├── LoginScreen.tsx           # Underline glassmorphic sign-in view
│   │   │   ├── RegisterScreen.tsx        # Multi-role sign-up view with terms validation
│   │   │   ├── DashboardScreen.tsx       # Role-differentiated dashboard (Client / Lawyer)
│   │   │   ├── LawyersScreen.tsx         # Verified advocate directory & booking triggers
│   │   │   ├── AiChatScreen.tsx          # Conversational legal assistant with statutory RAG
│   │   │   ├── DocumentsScreen.tsx       # Encrypted legal vault with PDF preview modal
│   │   │   └── ProfileScreen.tsx         # Account preferences and role verification
│   │   ├── services/                     # API connectors (authService, dashboardService)
│   │   └── theme/                        # Dynamic color tokens and typography system
│   ├── App.tsx                           # Root container & navigation bootstrap
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   └── package.json                      # Frontend dependencies & scripts
├── backend/                              # Node.js / Express REST API (TypeScript)
│   ├── data/
│   │   └── database.json                 # Persistent file-backed JSON database store
│   ├── src/
│   │   ├── controllers/                  # Route handlers (auth, lawyers, appointments, docs, AI)
│   │   ├── middleware/                   # JWT verification (verifyToken) & role guards (requireRole)
│   │   ├── models/                       # Atomic database store engine (db.ts)
│   │   ├── services/                     # Google OAuth token verification & Nepali Legal RAG
│   │   ├── config.ts                     # Environment variables & runtime constants
│   │   └── server.ts                     # Express server bootstrap (Port 3000)
│   ├── test_api.ts                       # Automated backend endpoint integration test suite
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   └── package.json                      # Backend dependencies & scripts
├── Nepal_Advocate_Contextual_Report.pdf  # Project academic contextual report
├── README.md                             # Primary project documentation
└── .gitignore                            # Repository ignore rules
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Mobile Device**: Expo Go app (Android / iOS) or an active simulator/emulator (Android Studio / Xcode)

---

### 2. Backend Setup & Execution

The backend requires zero external database installation. It initializes automatically using the embedded persistent JSON database store:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# (Optional) Verify all endpoints with the automated integration test suite
npx ts-node test_api.ts

# Start the development server (runs on http://localhost:3000)
npm run dev
```

#### Available REST API Endpoints:
- `GET  /api/health` — API status and timestamp check.
- `POST /api/auth/register` — User registration with role designation (`CLIENT` or `LAWYER`).
- `POST /api/auth/login` — Email/password authentication returning stateless JWT tokens.
- `POST /api/auth/google` — Federated Google OAuth token verification and user profile provisioning.
- `GET  /api/auth/me` — Fetches current authenticated user profile (requires Bearer JWT).
- `GET  /api/lawyers` — Returns directory of verified legal practitioners with bar license details.
- `POST /api/appointments` — Books a consultation slot, calculates 13% VAT, and issues booking tokens (`APT-XXXXXX`).
- `GET  /api/appointments/my` — Retrieves authenticated user's consultation bookings.
- `GET  /api/documents` — Lists encrypted legal files in the user's personal vault.
- `POST /api/documents` — Uploads and indexes a new legal draft record.
- `POST /api/ai/query` — Submits legal questions to the statutory RAG engine.
- `GET  /api/profile/dashboard` — Returns role-differentiated dashboard telemetry.

---

### 3. Frontend Setup & Execution

```bash
# Navigate to the frontend directory
cd sourcecode

# Install dependencies
npm install

# Start the Expo development server
npm start
```

#### Launching on Target Devices:
- Press `a` in the terminal to launch on an **Android Emulator**.
- Press `i` in the terminal to launch on an **iOS Simulator**.
- Press `w` in the terminal to open in a desktop/mobile **Web Browser**.
- Scan the printed QR code using the **Expo Go** app on a physical Android or iOS device connected to the same Wi-Fi network.

---

## Technical Specifications & Verification

- **Code Quality**: Strict TypeScript typings across frontend and backend with **0 compiler errors** (`npx tsc --noEmit`).
- **Endpoint Reliability**: 100% pass rate (9/9 endpoints) on automated integration tests (`backend/test_api.ts`).
- **Viewport Responsiveness**: Audited and certified across mobile viewports (320px–430px) and desktop web via Playwright automation.
- **Security & Privacy**: Client-side password entropy evaluation, Bcrypt salt-10 hashing on server credentials, stateless JWT session tokens, and compliance with the attorney-client statutory privilege under Section 44 of the Evidence Act 2031.

---

## License

This project is developed for academic purposes as part of the BSc (Hons) Software Engineering curriculum at the University of Bedfordshire / PCPS College. All rights reserved.
