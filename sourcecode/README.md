# NepalAdvocate Frontend (React Native & Expo)

This directory contains the React Native client application for **NepalAdvocate**.

---

## Quick Reference

- **Framework**: React Native with Expo SDK & TypeScript
- **State Management**: React Context (`AuthContext`, `LocalizationContext`)
- **Styling**: Vanilla React Native StyleSheet with custom design tokens (`src/theme/colors.ts`, `src/theme/typography.ts`)
- **Icons**: `lucide-react-native` vector icon set
- **Localization**: English (`EN`) and Nepali (`NE`) in `src/l10n/translations.ts`

---

## Key Modules & Components

| Directory / File | Description |
| :--- | :--- |
| `src/components/ui/floating-dock-navigation.tsx` | macOS-style floating action dock with touch gestures & scale animations |
| `src/components/ProfileHeaderCard.tsx` | Header card with user avatar, role badge, email, phone, location, and rating |
| `src/components/PasswordStrengthMeter.tsx` | Interactive password security evaluator |
| `src/components/RoleSelector.tsx` | Dual-pill toggle for Client / Advocate role selection |
| `src/screens/SplashScreen.tsx` | 3-layer animated vector SVG logo splash screen |
| `src/screens/DashboardScreen.tsx` | Main dashboard with Quick Actions, Lawyer Directory widget, and Recent Documents |
| `src/services/authService.ts` | Handles authentication API requests with automatic offline mock fallback |

---

## Development Workflow

### Starting Dev Server
```bash
npm start
```

### Running E2E / Layout Tests
```bash
node test_responsiveness.js
```
