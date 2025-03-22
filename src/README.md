
# Frontend Documentation - FitWell Gym Management System

This document provides details on the frontend architecture and components of the FitWell Gym Management System.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── AuthForm.tsx  # Authentication form component
│   ├── Footer.tsx    # Footer component
│   ├── Navbar.tsx    # Navigation bar component
│   └── ...
├── pages/            # Page components
│   ├── Dashboard.tsx # User dashboard
│   ├── Index.tsx     # Landing page
│   ├── Login.tsx     # Login page
│   ├── Register.tsx  # Registration page
│   └── ...
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── App.tsx           # Main application component with routing
```

## Technology Stack

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and state management
- **shadcn/ui**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **Sonner**: Toast notifications

## Key Components

### App.tsx

The main application component that sets up:
- React Query provider
- React Router with all application routes
- Global UI providers (Tooltip, Toast)

### Pages

- **Index.tsx**: Landing page with information about the gym
- **Login.tsx**: Login page wrapper with AuthForm
- **Register.tsx**: Registration page wrapper with AuthForm
- **Dashboard.tsx**: Dashboard interface (adapts based on user role)

### Components

- **AuthForm.tsx**: Handles both login and registration logic
- **Navbar.tsx**: Navigation bar with links and authentication state
- **Footer.tsx**: Page footer with links and information

## Authentication Flow

1. User registers or logs in via the AuthForm component
2. On successful authentication, JWT token is stored in localStorage
3. User is redirected to the appropriate dashboard based on role
4. Protected routes check for valid authentication before rendering

## API Integration

All API calls follow this pattern:
1. Base URL is set to `http://localhost:5000/api`
2. Requests include appropriate headers (Content-Type, Authorization)
3. Responses are parsed and handled with proper error management
4. Toast notifications inform users of success or failure

## Styling

The application uses Tailwind CSS for styling:
- Utility classes for responsive design
- Custom theme colors and design tokens
- shadcn/ui components built on Radix UI primitives

## State Management

- **Local state**: React useState for component-level state
- **URL state**: React Router for navigation state
- **Server state**: TanStack Query for API data fetching and caching

## Routing Structure

```
/                     # Landing page
/login                # Login page
/register             # Registration page
/student/dashboard    # Student dashboard
/staff/dashboard      # Staff dashboard
/admin/dashboard      # Admin dashboard
```

## Development Guidelines

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route to `App.tsx`
3. Update navigation to include links to the new page

### Creating New Components

1. Create the component in `src/components/`
2. Use TypeScript interfaces for props
3. Follow the existing styling patterns with Tailwind CSS
4. Document the component with JSDoc comments

### API Integration

1. Use fetch or React Query for API calls
2. Handle loading and error states
3. Implement proper validation before sending data
4. Use toast notifications for user feedback

## Build and Deployment

The project uses Vite for development and building:
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
