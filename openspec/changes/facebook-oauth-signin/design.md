## Context

The current authentication system supports Email/Password and Google OAuth. The project uses Supabase for backend services, which simplifies the integration of additional OAuth providers like Facebook. The UI follows Neumorphic design principles.

## Goals / Non-Goals

**Goals:**
- Add a "Continue with Facebook" button to the Sign-In page.
- Implement the authentication logic using Supabase's `signInWithOAuth`.
- Ensure the button styling is consistent with the existing Google login button.

**Non-Goals:**
- Implementing other social providers (Apple, GitHub, etc.) in this change.
- Handling advanced Facebook permissions (beyond basic profile and email).

## Decisions

### 1. Reuse Social Login Button Layout
**Decision**: The Facebook login button will be placed alongside the Google login button.
**Rationale**: This maintains UI consistency and follows common patterns where social login options are grouped.
**Alternatives**: Placing it in a separate section or a dropdown, which would be less intuitive.

### 2. Use Official Facebook Brand Colors
**Decision**: The button will use the Facebook blue (`#1877F2`) for the logo, while maintaining the Neumorphic card background.
**Rationale**: Brand recognition is important for trust and usability.
**Alternatives**: Using a monochromatic icon, which might be less recognizable.

### 3. Supabase OAuth Integration
**Decision**: Use `supabase.auth.signInWithOAuth({ provider: 'facebook' })`.
**Rationale**: Leveraging the existing Supabase infrastructure is the most efficient and secure way to implement OAuth.

## Risks / Trade-offs

- **[Risk]** Facebook OAuth requires a verified developer account and specific URLs (Privacy Policy, Terms of Service) to be "Live".
  - **Mitigation**: Add a note in the documentation about these requirements for production deployment.
- **[Trade-off]** Adding more social buttons can clutter the UI on mobile.
  - **Mitigation**: Ensure the layout stacks gracefully or uses a flexible grid.
