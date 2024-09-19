# Reusable Functions and Hooks Guide

This document provides an overview of the reusable functions and hooks implemented in our application, along with guidelines for their usage.

## Utility Functions

Location: `src/utils/index.js`

- `loginUser(email, password)`: Handles user login
- `registerUser(email, password, username)`: Handles user registration
- `getErrorMessage(error)`: Provides user-friendly error messages for authentication errors
- `isValidUrl(url)`: Checks if a given string is a valid URL
- `validatePhotoUrl(url)`: Validates a photo URL

Usage:
```javascript
import { loginUser, isValidUrl } from '@/utils';
```

## Booking Logic

Location: `src/app/components/bookingLogic.js`

- `fetchBookingsAndHotels(userId)`
- `cancelBooking(bookingId)`
- `modifyBooking(bookingId, newCheckIn, newCheckOut)`
- `fetchBookingDetails(bookingId)`
- `updateBooking(bookingId, bookingData)`
- `checkAvailability(hotelId, checkIn, checkOut, roomType)`
- `createBooking(bookingData)`
- `formatDate(date)`
- `getDateString(dateValue)`

These functions are used within the `useBookingAPI` hook.

## Custom Hooks

### useAuthForm

Location: `src/app/auth/hooks/useAuthForm.js`

Usage:
```javascript
const {
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  error,
  isLoading,
  handleSubmit,
} = useAuthForm(onSubmit, isRegister);
```

### useCreateHotelForm

Location: `src/app/admin/create-hotel/hooks/useCreateHotelForm.js`

Usage:
```javascript
const {
  activeTab,
  setActiveTab,
  hotel,
  errors,
  isLoading,
  handleChange,
  handleRoomChange,
  handlePhotoChange,
  handleRoomPhotoChange,
  addPhotoInput,
  addRoomPhotoInput,
  removePhotoInput,
  removeRoomPhotoInput,
  handleSubmit
} = useCreateHotelForm();
```

### useAuth

Location: `src/hooks/useAuth.js`

Usage:
```javascript
const { user, loading } = useAuth();
```

### useBookingAPI

Location: `src/hooks/useBookingAPI.js`

Usage:
```javascript
const {
  loading,
  error,
  fetchUserBookings,
  cancelUserBooking,
  modifyUserBooking,
  fetchUserBookingDetails,
  updateUserBooking,
  checkRoomAvailability,
  createUserBooking
} = useBookingAPI();
```

## Higher-Order Components (HOCs)

### withAuth

Location: `src/hocs/withAuth.js`

Usage:
```javascript
export default withAuth(YourComponent);
```

## Guidelines for Future Development

1. Always import utility functions from `@/utils` to ensure you're using the latest versions.
2. Use the custom hooks (`useAuthForm`, `useCreateHotelForm`, `useAuth`, `useBookingAPI`) to manage state and side effects in your components.
3. Wrap components that require authentication with the `withAuth` HOC.
4. When adding new functionality, consider if it can be implemented as a reusable function or hook. If so, add it to the appropriate utility file or create a new hook.
5. Update this document when adding new reusable functions or hooks to keep it as a comprehensive reference for the development team.
6. When modifying existing reusable functions, ensure that all components using them are updated accordingly.
7. Write unit tests for all reusable functions and hooks to ensure their reliability and catch potential issues early.

By following these guidelines and utilizing the reusable functions and hooks, we can maintain a consistent, efficient, and scalable codebase.