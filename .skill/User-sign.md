# Implement Complete User Management and Authentication

Implement a complete user-management system in the existing project. **First, inspect the current codebase, UI, routing, Supabase configuration, and existing product/store functionality.** Integrate the new features into the existing architecture without breaking current functionality.

## 1. UI Consistency
- Reuse the exact color palette, typography, font families, button styles, input styles, spacing, and visual language already used on other pages.
- Maintain consistent navbar, responsiveness, animations, and overall design.
- Do not introduce new fonts, colors, or a separate design system.
- Follow the existing project structure and coding conventions.

## 2. Navbar and Sign-In
- Keep only a **Sign In** option in the public navbar for authentication.
- Clicking Sign In should navigate to a dedicated sign-in page.
- Include email and password fields with proper validation.
- Provide **Forgot Password** and **Sign Up** links below the form.
- Implement proper loading states, validation messages, and authentication error handling.

## 3. Sign-Up
Create a registration page with the following fields:

- Full name
- Email address with valid email format validation and uniqueness checks
- Contact number with appropriate phone validation
- Address:
  - House/Flat number
  - Street
  - City/Town
  - State
  - Country
- Password and confirm password, with appropriate password validation

Validate all required fields on both the frontend and backend. Prevent duplicate registrations and provide clear error messages. Implement email verification if supported by the existing authentication setup.

## 4. Authentication and Session Management
- Use Supabase Auth for secure registration, sign-in, sign-out, password recovery, and session management.
- Persist and restore sessions securely across page refreshes using the recommended Supabase authentication flow.
- Protect authenticated routes and prevent unauthenticated users from accessing private account pages.
- Handle expired sessions, sign-out, password resets, and authentication failures.
- Ensure restricted users cannot sign in or continue using an existing session.
- Never store plaintext passwords or implement custom password storage.

## 5. User Profile
Create a profile page accessible to authenticated users.

Display the user's name, email, phone number, and complete address. Allow users to edit and save their profile details, with appropriate validation.

Include the following sections:

### My Profile
View and update personal information and address details.

### My Favourites / Wishlist
- Integrate with the existing product listing or product-story page.
- Allow users to add and remove products from their wishlist.
- Display saved products as product cards using the existing product-card component and styling.
- Persist wishlist items in Supabase so they remain available across sessions and devices.
- Support removing items from the wishlist and navigating to the relevant product details.
- Ensure wishlist data belongs to the authenticated user.

### Feedback
- Provide a text area where users can submit feedback, suggestions, or comments.
- Enforce a reasonable word limit, such as 100 words, and display a live word counter.
- Validate empty submissions and show success or error messages.
- Save feedback in Supabase with the user ID and submission timestamp.
- Allow users to view their own submitted feedback. If editing or deletion is supported, restrict these actions to their own records.

## 6. Supabase Database and Security
Use the existing Supabase project and database configuration. Create or update the required tables and migrations.

Design appropriate tables for:
- User profiles
- Wishlist items
- User feedback

Use Supabase Auth as the source of truth for user identity. Associate profile, wishlist, and feedback records with the authenticated user's ID.

Implement:
- Appropriate primary keys, foreign keys, unique constraints, and timestamps.
- Row Level Security (RLS) policies for all user-owned data.
- Policies that allow users to access and modify only their own permitted records.
- Secure handling of environment variables and service-role credentials.
- Server-side validation and authorization for protected operations.

Do not expose service-role keys or trust client-supplied user IDs for authorization.

## 7. Backend APIs and CRUD
Implement and integrate the necessary APIs using the project's existing backend framework and conventions.

Support complete CRUD operations where appropriate:

- **Profile:** Create, read, and update profile details.
- **Wishlist:** Add products, list saved products, remove products, and prevent duplicate entries.
- **Feedback:** Create, read, update, and delete feedback according to the intended permissions.
- **Authentication:** Registration, login, logout, session validation, and password recovery.
- **Admin user management:** List users, inspect user details, and restrict or restore login access.

Every protected endpoint must verify authentication and authorization. Validate request bodies, handle errors consistently, and return appropriate HTTP status codes.

Avoid duplicating functionality already implemented in the project.

## 8. Admin User Management
Create a user-management section inside the existing admin dashboard. Reuse its current layout, navigation, typography, and components.

Display a searchable and manageable list of registered users with:
- Name
- Email
- Phone number
- Account status: Active or Restricted
- Action to restrict or restore access

Allow authorized admins to inspect user details and restrict a user from logging in when necessary. Provide a confirmation dialog before restricting an account and clear feedback after each action.

Implement account restrictions securely on the server. Do not rely on hiding UI elements or setting a client-side flag alone. Ensure restrictions take effect for new logins and existing sessions, and prevent restricted users from accessing protected APIs.

Only authorized administrators may access these operations. Enforce admin authorization on every relevant endpoint and database operation.

## 9. Implementation and Testing
- Integrate all pages and flows with the existing application.
- Preserve existing product pages, product cards, wishlist-related UI, and admin functionality.
- Add database migrations and document any required environment variables or Supabase configuration.
- Test registration, login, logout, password recovery, session persistence, profile updates, wishlist CRUD, feedback validation, and admin restrictions.
- Test unauthorized access, cross-user data access, duplicate wishlist items, invalid inputs, and restricted-user sessions.
- Ensure the project builds successfully and follows existing linting and type-checking standards.

## Expected Outcome
Deliver a fully integrated, production-conscious user-management system with consistent UI, secure Supabase authentication, persistent user profiles, wishlist and feedback functionality, complete APIs, database security, and admin-controlled account restrictions.

**Important:** Inspect the existing implementation before making changes. Reuse existing components, APIs, tables, and styles wherever possible. Do not create disconnected demo pages, mock data, or frontend-only functionality. Implement and verify the complete end-to-end flow.