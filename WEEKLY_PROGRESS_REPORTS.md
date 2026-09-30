# NepalAdvocate: Week 3 Coding Progress Summary
### *BSc (Hons) Software Engineering — Final Year Project*

**Student Name**: Sujal Kunwar  
**Student ID**: 2337702  
**Supervisor**: Pawan Kc  
**Week**: Week 3  
**Focus**: Coding & Technical Implementation (Authentication, Form Controls, Google Auth & Bilingual State)

---

## What I Coded in Week 3

### 1. Minimal Underline Input Component ([`CustomInput.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/CustomInput.tsx))
- **Animated Underline Focus**: Used React Native's `Animated.timing` to animate the bottom border highlight from `theme.cardBorder` to `theme.primary` on focus (200ms) and revert on blur.
- **Password Visibility Toggle**: Integrated `lucide-react-native` icons (`Eye`, `EyeOff`, `Lock`, `Mail`) with a 12px `hitSlop` area. Tapping the eye flips `isSecureTextEntry` without re-rendering parent form fields.
- **Error Display**: Added inline error text rendering beneath the underline with red styling (`theme.error`).
- **Devanagari Font Fix**: Removed hardcoded heights, set `minHeight: 48`, `paddingVertical: 10`, and `lineHeight: 22` to prevent Devanagari vowel marks (*raswa/dirgha ikar*, *chandrabindu*, *reph*) from being clipped on Android.

### 2. Password Strength Evaluator ([`PasswordStrengthMeter.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/PasswordStrengthMeter.tsx))
- **Entropy Calculation Algorithm**: Evaluates input password against 5 rules in real time:
  - Minimum 6 characters (+1 point)
  - 10+ characters (+1 point)
  - Mixed case (`[a-z]` and `[A-Z]`) (+1 point)
  - Numeric digits (`[0-9]`) (+1 point)
  - Special symbols (`[!@#$%^&*(),.?":{}|<>]`) (+1 point)
- **Dynamic 4-Tier Colored Progress Bar**:
  - Score 1 (Weak): Red (`#EF4444`) — blocks submission
  - Score 2 (Fair): Orange (`#F59E0B`)
  - Score 3 (Good): Blue (`#3B82F6`)
  - Score 4 (Strong): Green (`#10B981`)
- **Animated Width & Localization**: Animates bar width using React Native layout animation, displaying localized status (*"कमजोर"*, *"मध्यम"*, *"राम्रो"*, *"अति बलियो"*).

### 3. Multi-Role Sliding Toggle ([`RoleSelector.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/RoleSelector.tsx))
- **Sliding Pill Animation**: Implemented an animated pill toggle using `Animated.spring` that glides behind the active role.
- **Role State Emission**: Emits `'CLIENT' | 'LAWYER'` to the parent registration form, dynamically showing or hiding role-specific fields (like Bar Council License Number for advocates).

### 4. Google One-Tap Authentication Modal ([`GoogleAuthModal.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/GoogleAuthModal.tsx))
- **Account Chooser UI**: Built a bottom-sheet modal rendering Google user profiles (avatar, full name, and email).
- **Embedded Role Selection**: Included role selection directly within the Google modal so new Google sign-ups specify whether they are registering as a Client or Advocate.
- **Backend & Offline Flow**: Calls `authService.googleLogin()`, which sends the payload to backend `/api/auth/google`. If offline, it automatically falls back to local authenticated storage.

### 5. Social Auth Buttons ([`SocialButtons.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/SocialButtons.tsx))
- Built reusable social sign-in buttons for Google, Apple, and Facebook with glassmorphic cards and press opacity feedback.

### 6. Bilingual Localization Dictionary ([`translations.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/l10n/translations.ts))
- Built a centralized dictionary with 120+ translation keys for both English and Nepali Devanagari.
- Coded legal terminology (*सेवाग्राही* for Client, *कानुन व्यवसायी* for Lawyer, *सेवाका सर्तहरू* for Terms of Service, *गोपनीयता नीति* for Privacy Policy).
- Coupled with `LanguageToggle.tsx` to switch languages instantly across the entire app without reloading.

### 7. Session State & Context ([`AuthContext.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/context/AuthContext.tsx))
- Created global auth context using React Context API + `@react-native-async-storage/async-storage`.
- Managed states: `user`, `role`, `token`, `language`, and `isLoading`.
- Implemented methods: `login()`, `register()`, `googleLogin()`, `logout()`, `toggleLanguage()`, and `clearError()`.
- Added an `isLoading` gate to eliminate the 150ms screen flash on app launch when hydrating stored credentials.

### 8. Authentication Service Layer ([`authService.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/services/authService.ts))
- Implemented API communication layer connecting to backend endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/google`
  - `GET /api/auth/me`
- Added offline resiliency: if the backend server is unreachable, it logs in with local mock credentials so the UI never crashes during development or offline demos.

### 9. Screen Ergonomics & Keyboard Handling ([`LoginScreen.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/screens/LoginScreen.tsx) & [`RegisterScreen.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/screens/RegisterScreen.tsx))
- Built the screens combining `CustomInput`, `RoleSelector`, `PasswordStrengthMeter`, and `GoogleAuthModal`.
- Solved keyboard obstruction by implementing platform-specific behavior:
  ```tsx
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled">
      {/* Form Fields */}
    </ScrollView>
  </KeyboardAvoidingView>
  ```
- Added terms acceptance validation in `RegisterScreen.tsx` with animated red alert feedback if terms are bypassed.

### 10. Backend Auth Endpoints ([`backend/src/services/googleAuthService.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/backend/src/services/googleAuthService.ts) & [`backend/src/middleware/authMiddleware.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/backend/src/middleware/authMiddleware.ts))
- Built Google token processing and user provisioning in the backend JSON database.
- Implemented JWT token generation and role verification middleware (`verifyToken`, `requireRole`).
