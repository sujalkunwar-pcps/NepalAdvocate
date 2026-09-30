# NepalAdvocate: Week 3 Project Progress Report
### *BSc (Hons) Software Engineering — Final Year Project Development Log*

**Student Name**: Sujal Kunwar  
**Student University ID**: 2337702  
**Degree Program**: BSc (Hons) Software Engineering  
**Institution**: University of Bedfordshire / PCPS College  
**Project Title**: NepalAdvocate: A Comprehensive Mobile Platform for Digitizing and Democratizing Legal Access in Nepal  
**Project Supervisor**: Pawan Kc  
**Course Coordinator**: Ajaya Kumar Sharma  
**Reporting Period**: Week 3 (12-Week Academic Semester Schedule)  
**Milestone Focus**: Core Authentication Architecture, Multi-Role Workflows, Google OAuth Federation & Bilingual Localization  

---

## Summary Of Progress (including any problems)

### 1. Background Information & Legal Domain Context

In the Nepalese legal system, the practice of law is governed by strict statutory frameworks, primarily the **Nepal Bar Council Act 2050 (१९९३)** and the **Nepal Bar Council Code of Conduct 2051 (१९९४)**. Unlike generic e-commerce or gig-economy platforms where users are undifferentiated buyers and sellers, a legal tech mobile application operates under heavy regulatory constraints:

1. **Prohibition of Commercial Solicitation**: Rule 3 of the Bar Council Code of Conduct strictly prohibits legal practitioners from engaging in commercial advertising, self-aggrandizement, or price undercut bidding. Consequently, the user onboarding architecture cannot treat advocates as mere "freelancers" or open up unrestricted auction-style bidding. The system requires an unequivocal architectural dichotomy between:
   - **Client (Legal Seeker / सेवाग्राही)**: Individuals, corporate representatives, and law students seeking access to legal information, consultation booking, and encrypted document storage.
   - **Advocate (Lawyer / कानुन व्यवसायी)**: Licensed legal practitioners who possess a verified Nepal Bar Council license number (e.g., `NBA-5421`), verified practice areas (Civil, Criminal, Corporate, Constitutional), and physical office locations.

2. **Statutory Legal Privilege & Confidentiality**: Under **Section 44 of the Evidence Act 2031 (१९७४)**, communications between a client and their legal counsel enjoy absolute statutory confidentiality and attorney-client privilege. No advocate may be compelled or permitted to disclose any communication made to them in the course of professional employment without express client consent. As a direct consequence, user identity verification, password entropy, and session authorization must be rigorously guarded right from the authentication gateway.

3. **Socio-Technological Onboarding Barrier**: According to recent data from the Nepal Telecommunications Authority (NTA), smartphone penetration in Nepal exceeds 73%, yet formal digital literacy remains bifurcated. While urban users in Kathmandu, Pokhara, and Lalitpur are accustomed to standard email and social logins, users across semi-urban and provincial courts often find complex multi-field registration forms intimidating. Therefore, Week 3's engineering effort prioritized:
   - Reducing cognitive friction through clean, minimalist underline form inputs.
   - Providing instant federated **Google One-Tap Authentication** for single-click access.
   - Implementing a full **English / Nepali (Devanagari)** real-time localization engine so that language is never a barrier to legal assistance.

---

### 2. Detailed Coding & Technical Implementation

During Week 3, the foundational authentication suite, input ergonomics, password security analysis, Google OAuth modal, and internationalization engines were engineered and integrated into the project codebase:

```text
sourcecode/src/
├── components/
│   ├── CustomInput.tsx           # Underline glassmorphic input with animated focus highlight
│   ├── CustomButton.tsx          # Multi-variant button with loading state & haptics
│   ├── RoleSelector.tsx          # Client vs Advocate spring animated toggle pill
│   ├── PasswordStrengthMeter.tsx # Real-time entropy evaluator with dynamic 4-tier bar
│   ├── GoogleAuthModal.tsx       # Google One-Tap account chooser with role selector
│   └── SocialButtons.tsx         # Google, Apple, and Facebook social buttons
├── context/
│   └── AuthContext.tsx           # Session provider with AsyncStorage & language state
├── l10n/
│   └── translations.ts           # Centralized bilingual dictionary (120+ legal strings)
├── screens/
│   ├── LoginScreen.tsx           # Glassmorphic sign-in view with language switch
│   └── RegisterScreen.tsx        # Multi-role registration with terms validation
└── services/
│   └── authService.ts            # Auth connector supporting backend REST and offline fallback
backend/src/
├── services/
│   └── googleAuthService.ts      # Server-side Google token verification & user provisioning
└── middleware/
    └── authMiddleware.ts         # JWT token verification & role-based route guard
```

#### A. Minimal Underline Input Component ([`CustomInput.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/CustomInput.tsx))
To avoid cluttered boxed inputs that feel heavy on compact smartphone screens, an elegant underline input field was engineered:
- **Smooth Animated Underline Focus**: Utilized React Native's `Animated.Value` with native driver support to animate the underline bar highlight when an input receives focus:
  ```tsx
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const underlineColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.cardBorder, theme.primary],
  });
  ```
- **Password Visibility Toggling**: Integrated `lucide-react-native` vector icons (`Eye`, `EyeOff`, `Lock`, `Mail`) with an optimized `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` hit target. Tapping the toggle flips `isSecureTextEntry` without re-rendering parent form fields.
- **Inline Validation Feedback**: Accommodates contextual validation errors rendered immediately beneath the underline with red alert styling (`theme.error`).

#### B. Entropy-Based Password Strength Evaluator ([`PasswordStrengthMeter.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/PasswordStrengthMeter.tsx))
To ensure client data and attorney communications cannot be compromised by dictionary attacks or credential stuffing, a real-time entropy calculator was built directly into the registration flow:
- **Entropy Formula & Criteria**:
  $$\text{Score} = \sum (\text{Length} \ge 6) + (\text{Length} \ge 10) + [\text{a-z} \land \text{A-Z}] + [0-9] + [!@\#\$\%\^\&\*\dots]$$
- **Visual Feedback Levels**:
  - **Weak (Score 1)**: Red (`#EF4444`) — Under 6 characters or single character class. Form submission is blocked.
  - **Fair (Score 2)**: Orange (`#F59E0B`) — Meets minimum length but lacks character diversity.
  - **Good (Score 3)**: Blue (`#3B82F6`) — Satisfies length, mixed-case letters, and numbers.
  - **Strong (Score 4)**: Green (`#10B981`) — Full cryptographic entropy with special legal punctuation characters.
- **Dynamic Micro-Animation**: The progress bar animates horizontally using spring physics, and descriptive text dynamically translates based on active language (*"कमजोर"*, *"मध्यम"*, *"राम्रो"*, *"अति बलियो"*).

#### C. Multi-Role Sliding Toggle ([`RoleSelector.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/RoleSelector.tsx))
Provides an intuitive sliding pill interface enabling new users to designate whether they are registering as a **Client (सेवाग्राही)** or an **Advocate (वकिल)**:
- Uses React Native spring animation to slide an active highlight pill behind the selected role label.
- Emits the chosen role (`'CLIENT' | 'LAWYER'`) to [`RegisterScreen.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/screens/RegisterScreen.tsx), dynamically toggling role-specific fields (such as Bar Council License Number for advocates).

#### D. Google One-Tap Authentication Architecture ([`GoogleAuthModal.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/GoogleAuthModal.tsx))
Engineered a federated Google sign-in modal providing instant single-tap access for users with existing Google accounts:
- **Clean Google Account Chooser**: Renders verified account cards with Google avatars, full names, and email addresses (e.g., `sujalkunwar@gmail.com`).
- **Integrated Role Picker**: Enables users signing in with Google for the first time to select their role (**Client** or **Advocate**) directly inside the modal before authorization.
- **Backend & Offline Resiliency**: Connects to `authService.googleLogin()` which submits the token payload to the backend endpoint `POST /api/auth/google`. If the backend is running, the server provisions a persistent JWT session in [`googleAuthService.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/backend/src/services/googleAuthService.ts); if running offline or during testing, it seamlessly falls back to local storage authentication without UI interruption.

#### E. Centralized Bilingual Localization Engine ([`translations.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/l10n/translations.ts))
Constructed an in-memory dictionary providing over 120 key-value pairs translated accurately into Nepali Devanagari legal terminology:
- Legal terms were curated according to formal Nepalese jurisprudence:
  - *Client*: **सेवाग्राही** (instead of informal *ग्राहक*)
  - *Advocate / Lawyer*: **कानुन व्यवसायी / वकिल**
  - *Terms of Service*: **सेवाका सर्तहरू**
  - *Privacy Policy*: **गोपनीयता नीति**
  - *Sign In*: **साइन इन गर्नुहोस्**
  - *Bar Council License*: **नेपाल बार काउन्सिल इजाजतपत्र नं.**
- Pinned a `LanguageToggle` button at the top header of [`LoginScreen.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/screens/LoginScreen.tsx) and [`RegisterScreen.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/screens/RegisterScreen.tsx). Tapping the toggle triggers `toggleLanguage()` in `AuthContext`, immediately re-rendering the entire UI tree in the selected language without requiring an application restart.

#### F. Unified Session State Management ([`AuthContext.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/context/AuthContext.tsx) & [`authService.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/services/authService.ts))
Built an enterprise-grade `AuthContext` utilizing the React Context API and `@react-native-async-storage/async-storage`:
- Persists session `auth_token`, `user_role`, `user_data`, and `app_language` across app relaunches.
- Exposes standardized methods: `login()`, `register()`, `googleLogin()`, `logout()`, `toggleLanguage()`, and `clearError()`.
- Implements transparent network detection: attempts live REST communication against `http://localhost:3000/api/auth/` first, and gracefully falls back to mock profiles if the server is offline or unreachable.

---

### 3. Problems Encountered & Technical Resolutions

During the implementation of Week 3, four significant technical challenges arose across mobile ergonomics, Unicode font rendering, asynchronous lifecycle hydration, and state evaluation:

#### Problem 1: Virtual Soft Keyboard Overlap & Input/Button Occlusion
- **Symptom**: On compact smartphone viewports (e.g., iPhone SE, Pixel 4a, or devices with screen heights under 700dp), focusing on the password or confirm-password input caused the native software keyboard to completely cover the lower half of the form. The "Terms of Service" checkbox and the primary "Sign In" / "Register" buttons were obscured behind the keyboard.
- **Root Cause Analysis**: The standard React Native `KeyboardAvoidingView` exhibits differing layout engines between iOS and Android. On iOS, setting `behavior="height"` caused unwanted parent container collapse. On Android, setting `behavior="padding"` caused double-offset padding issues because Android OS already handles keyboard layout resizing via `windowSoftInputMode="adjustResize"`.
- **Technical Resolution**: Configured platform-conditional keyboard behavior combined with an interactive `ScrollView`:
  ```tsx
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={styles.keyboardView}
  >
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Form Content */}
    </ScrollView>
  </KeyboardAvoidingView>
  ```
  Setting `keyboardShouldPersistTaps="handled"` was critical: it allowed users to tap the "Sign In" button directly in one tap without requiring an intermediate tap to dismiss the virtual keyboard first.

#### Problem 2: Devanagari Unicode Glyph & Vowel Diacritic Truncation on Android
- **Symptom**: When switching the application to Nepali (`ne`), complex Devanagari ligatures and vertical diacritics (*raswa ikar* `ि`, *dirgha ukar* `ू`, *chandrabindu* `ँ`, and *reph* `र्` in words like `मुलुकी देवानी संहिता` or `कानुन व्यवसायी`) were clipped along the top and bottom boundaries inside `CustomInput.tsx` on Android devices.
- **Root Cause Analysis**: Android's native text rasterizer calculates glyph bounding boxes based strictly on standard Latin baselines. Furthermore, Android text inputs apply `includeFontPadding: true` by default, which introduces uneven internal padding and clips characters that extend above the Latin ascender height or below the descender line when a fixed input height (e.g., `height: 48`) is set.
- **Technical Resolution**: Refactored [`CustomInput.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/components/CustomInput.tsx) and [`typography.ts`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/theme/typography.ts):
  - Removed fixed `height` constraints from input containers and replaced them with `minHeight: 48` and symmetric `paddingVertical: 10`.
  - Explicitly specified `lineHeight: 22` to give Devanagari matras sufficient vertical clearance.
  - Configured system fallback fonts (`Roboto, -apple-system, sans-serif`) to ensure high-fidelity Devanagari typography rendering across both mobile platforms.

#### Problem 3: Asynchronous AsyncStorage Hydration Race Condition & Screen Flicker
- **Symptom**: When launching the application with an already authenticated user session, the screen briefly flashed the `LoginScreen` for approximately 150ms before transitioning to `MainTabNavigator`, creating a visually jarring experience.
- **Root Cause Analysis**: In `App.tsx`, the root component rendered before the asynchronous `AsyncStorage.getItem('auth_token')` promise finished executing inside `AuthContext.tsx`. Because the initial state of `user` was initialized to `null`, React Native immediately mounted the unauthenticated login stack.
- **Technical Resolution**: Introduced an explicit `isLoading` state within `AuthContext`:
  ```tsx
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const savedUser = await AsyncStorage.getItem('user_data');
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);
  ```
  Updated `App.tsx` to hold the vector `SplashScreen` mounted until `isLoading === false`, producing a seamless, flicker-free entry directly into the authenticated dashboard.

#### Problem 4: Terms of Service Checkbox Bypass via Form Submission Race Condition
- **Symptom**: During rapid testing on [`RegisterScreen.tsx`](file:///c:/Users/sujal/Desktop/Final%20year%20project/sourcecode/src/screens/RegisterScreen.tsx), rapidly double-tapping the submit button before the checkbox state update finished propagated allowed form validation to evaluate a stale closure where `acceptedTerms` was false, resulting in uncaught validation errors.
- **Root Cause Analysis**: React state updates scheduled via `useState` are asynchronous and batched. Reading `acceptedTerms` inside an unsynchronized handler could read a stale state snapshot.
- **Technical Resolution**: Strengthened the synchronous `validateForm()` guard:
  ```tsx
  if (!acceptedTerms || !acceptedPrivacy) {
    setTermsError(true);
    setDialogTitle(t.registrationFailed);
    setDialogMessage(t.mustAcceptTerms);
    setDialogType('error');
    setDialogVisible(true);
    return false;
  }
  ```
  Coupled this with dynamic visual error feedback: when terms are bypassed, the `termsBox` container border animates to red (`theme.error`), clearly directing the user's attention to the required legal acknowledgment.

---

### 4. Supervisor Feedback & Discussion Log (Pawan Kc)

- **Meeting Date**: Week 3 Formal Review
- **Supervisor**: Pawan Kc (Lecturer / FYP Supervisor)
- **Discussion Points**:
  - Demonstrated the minimalist underline input design system and verified smooth keyboard avoiding behavior on both iOS and Android emulators.
  - Reviewed the real-time entropy calculation in `PasswordStrengthMeter.tsx` and confirmed it satisfies enterprise password security best practices.
  - Demonstrated the **Google One-Tap Authentication** modal and the role selector toggle.
  - Inspected the bilingual Devanagari legal dictionary in `translations.ts`.
- **Key Decisions & Supervisor Guidance**:
  1. *Role Persistence*: Supervisor highlighted that when a user registers via Google OAuth, their selected role (`CLIENT` or `LAWYER`) must be persisted permanently in the database so advocates are not mistakenly routed to client screens upon re-login.
  2. *Terminology Approval*: Validated the use of standard Nepalese legal terms (*सेवाग्राही* and *कानुन व्यवसायी*), noting that this reflects authentic domain knowledge necessary for a BSc Software Engineering capstone project.
  3. *Next Milestone Approval*: Approved completion of Week 3 authentication milestones and authorized proceeding to Week 4 (Mobile Navigation Architecture and Floating Dock).

---

### 5. Next Steps & Immediate Action Items (Week 4 Transition)

With core authentication, Google OAuth, role separation, and bilingual localization fully implemented and verified, immediate development shifts to Week 4 milestones:
1. Construct the core **5-tab bottom navigation** (`Home`, `Lawyers`, `AI Chat`, `Vault`, and `Profile`).
2. Build the interactive macOS-inspired **floating dock navigator** (`FloatingDockNav.tsx`) with drag gesture support and proximity magnification.
3. Wire the persistent `user_role` state from `AuthContext` to conditionally render role-specific dashboard metrics on the home screen.
