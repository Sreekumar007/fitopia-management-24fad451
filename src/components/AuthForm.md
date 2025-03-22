
# AuthForm Component Documentation

The `AuthForm` component handles user authentication (both login and registration) in the FitWell Gym Management System.

## Component Overview

`AuthForm` is a reusable component that dynamically renders either a login or registration form based on the `type` prop. The component handles form submission, validation, and API communication.

## Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `type` | `"login"` or `"register"` | Determines the form type | Yes |

## Functionality

### State Management

The component manages several pieces of state:
- `email` - User's email address
- `password` - User's password
- `name` - User's full name (only for registration)
- `role` - User's role (student, staff, or admin)
- `isLoading` - Loading state during API calls

### Authentication Flow

1. **Registration**:
   - Collects user name, email, password, and role
   - Sends data to `/api/auth/register` endpoint
   - Redirects to login page on success
   - Displays an error toast on failure

2. **Login**:
   - Collects user email, password, and role
   - Sends data to `/api/auth/login` endpoint
   - Stores JWT token and user information in localStorage
   - Redirects to appropriate dashboard based on user role
   - Displays an error toast on failure

### API Integration

The component interacts with the backend API using fetch:
- Uses `http://localhost:5000/api` as the base URL
- Sends JSON-formatted requests
- Handles API responses and errors

### Role-Based Redirection

After successful login, users are redirected based on their role:
- Students: `/student/dashboard`
- Staff: `/staff/dashboard`
- Administrators: `/admin/dashboard`

## Example Usage

```tsx
// Login form
<AuthForm type="login" />

// Registration form
<AuthForm type="register" />
```

## UI Elements

The component renders different form fields based on the type:

### Common Fields (Both Forms)
- Email input
- Password input
- Role selection dropdown
- Submit button with loading state

### Registration Form Only
- Full name input

## Dependencies

- React
- react-router-dom (for navigation)
- shadcn/ui components (Button, Input, Label, Select)
- sonner (for toast notifications)

## Error Handling

The component displays toast notifications for:
- Successful registration
- Successful login
- Authentication failures (with specific error messages)

## Security Considerations

- Passwords are never stored in component state longer than necessary
- JWT tokens are stored in localStorage
- API errors are displayed in user-friendly format
