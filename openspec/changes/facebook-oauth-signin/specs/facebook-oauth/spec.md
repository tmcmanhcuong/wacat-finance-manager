## ADDED Requirements

### Requirement: Initiate Facebook OAuth Login
The system SHALL provide a mechanism to initiate authentication using Facebook as an OAuth provider via Supabase.

#### Scenario: User clicks Facebook login button
- **WHEN** the user clicks the "Continue with Facebook" button
- **THEN** the system SHALL call `supabase.auth.signInWithOAuth` with `provider: 'facebook'` and the appropriate redirect URL.

### Requirement: Handle Facebook OAuth Redirect
The system SHALL handle the redirection back to the application after a successful or failed Facebook authentication.

#### Scenario: Successful Facebook authentication
- **WHEN** the user successfully authenticates with Facebook and is redirected back to the app
- **THEN** the system SHALL establish a session and redirect the user to the Dashboard.

### Requirement: Facebook Login Button UI
The system SHALL display a Facebook login button on the sign-in page, styled with Neumorphic design principles.

#### Scenario: Display on Sign-In Page
- **WHEN** the user is on the Sign-In page
- **THEN** the system SHALL show a button with the Facebook logo and the text "Continue with Facebook", positioned alongside other social login options.
