## Why

Adding Facebook login provides users with more flexible authentication options, improving the onboarding experience and potentially increasing user conversion. Many users prefer using their existing social media accounts instead of creating a new email/password combination.

## What Changes

- Add a "Continue with Facebook" button to the `SignIn` page, styled consistently with the existing Google login button using Neumorphic design principles.
- Implement the Facebook OAuth flow using Supabase's `signInWithOAuth` method.
- Update documentation to include instructions for setting up Facebook Login in the Meta for Developers portal and Supabase dashboard.

## Capabilities

### New Capabilities
- `facebook-oauth`: Implementation of Facebook as an OAuth provider in the authentication flow.

### Modified Capabilities
- None.

## Impact

- **UI**: `src/app/pages/signin.tsx` will be updated to include the new button.
- **Configuration**: Requires new environment variables (`VITE_FACEBOOK_CLIENT_ID`) or configuration in the Supabase dashboard.
- **Dependencies**: Uses existing `@supabase/supabase-js`.
