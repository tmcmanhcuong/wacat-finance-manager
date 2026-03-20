## 1. UI Implementation

- [x] 1.1 Add Facebook icon SVG to `src/app/pages/signin.tsx` (modeled after Google icon).
- [x] 1.2 Implement the Facebook login button component in `src/app/pages/signin.tsx` using Neumorphic styling.
- [x] 1.3 Adjust the layout to accommodate two social login buttons (Google and Facebook).

## 2. Authentication Logic

- [x] 2.1 Add `handleFacebookSignIn` function in `src/app/pages/signin.tsx` using `supabase.auth.signInWithOAuth`.
- [x] 2.2 Bind the `handleFacebookSignIn` function to the new Facebook login button.

## 3. Verification

- [ ] 3.1 Verify that the Facebook button appears correctly in both Light and Dark modes.
- [ ] 3.2 Verify that clicking the button initiates the Facebook OAuth flow (redirects to Facebook).
- [ ] 3.3 Verify that successful authentication redirects the user back to the application Dashboard.
