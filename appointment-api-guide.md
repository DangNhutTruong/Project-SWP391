# Appointment API Documentation

This document provides information on how to use the Appointment API endpoints.

## Base URL

```
/api/appointments
```

## Authentication

All endpoints require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

## Endpoints

### 1. Create a New Appointment

**Endpoint:** `POST /api/appointments`

**Description:** Create a new appointment with a coach.

**Request Body:**

```json
{
  "coach_id": 1,
  "appointment_time": "2025-07-10T14:00:00",
  "duration_minutes": 30
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": 1,
    "coach_id": 1,
    "user_id": 2,
    "appointment_time": "2025-07-10T14:00:00",
    "duration_minutes": 30,
    "status": "pending",
    "created_at": "2025-07-07T10:00:00",
    "updated_at": "2025-07-07T10:00:00",
    "coach_name": "Coach Name",
    "coach_avatar": "profile_image_url"
  }
}
```

### 2. Get User's Appointments

**Endpoint:** `GET /api/appointments/user`

**Description:** Get all appointments for the authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "Appointments fetched successfully",
  "data": [
    {
      "id": 1,
      "coach_id": 1,
      "user_id": 2,
      "appointment_time": "2025-07-10T14:00:00",
      "duration_minutes": 30,
      "status": "pending",
      "created_at": "2025-07-07T10:00:00",
      "updated_at": "2025-07-07T10:00:00",
      "coach_name": "Coach Name",
      "coach_avatar": "profile_image_url"
    },
    // More appointments...
  ]
}
```

### 3. Get Appointment by ID

**Endpoint:** `GET /api/appointments/:id`

**Description:** Get details of a specific appointment by its ID.

**Response:**

```json
{
  "success": true,
  "message": "Appointment fetched successfully",
  "data": {
    "id": 1,
    "coach_id": 1,
    "user_id": 2,
    "appointment_time": "2025-07-10T14:00:00",
    "duration_minutes": 30,
    "status": "pending",
    "created_at": "2025-07-07T10:00:00",
    "updated_at": "2025-07-07T10:00:00",
    "coach_name": "Coach Name",
    "coach_avatar": "profile_image_url",
    "user_name": "User Name",
    "user_avatar": "user_profile_image_url"
  }
}
```

### 4. Update Appointment

**Endpoint:** `PUT /api/appointments/:id`

**Description:** Update an existing appointment.

**Notes:**
- User can update time and duration
- Coach can update status

**Request Body:**

```json
{
  "appointment_time": "2025-07-12T15:00:00",
  "duration_minutes": 45,
  "status": "confirmed"  // Only coach can update status
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "id": 1,
    "coach_id": 1,
    "user_id": 2,
    "appointment_time": "2025-07-12T15:00:00",
    "duration_minutes": 45,
    "status": "confirmed",
    "created_at": "2025-07-07T10:00:00",
    "updated_at": "2025-07-07T11:00:00",
    "coach_name": "Coach Name",
    "coach_avatar": "profile_image_url",
    "user_name": "User Name",
    "user_avatar": "user_profile_image_url"
  }
}
```

### 5. Delete Appointment

**Endpoint:** `DELETE /api/appointments/:id`

**Description:** Delete an appointment. Only the user who created the appointment can delete it.

**Response:**

```json
{
  "success": true,
  "message": "Appointment deleted successfully",
  "data": null
}
```

### 6. Cancel Appointment

**Endpoint:** `PUT /api/appointments/:id/cancel`

**Description:** Cancel an appointment. Both the user and coach can cancel an appointment.

**Response:**

```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": 1,
    "coach_id": 1,
    "user_id": 2,
    "appointment_time": "2025-07-12T15:00:00",
    "duration_minutes": 45,
    "status": "cancelled",
    "created_at": "2025-07-07T10:00:00",
    "updated_at": "2025-07-07T12:00:00",
    "coach_name": "Coach Name",
    "coach_avatar": "profile_image_url",
    "user_name": "User Name",
    "user_avatar": "user_profile_image_url"
  }
}
```

### 7. Rate Appointment

**Endpoint:** `POST /api/appointments/:id/rating`

**Description:** Add a rating and feedback for a completed appointment. Only the user can rate an appointment.

**Request Body:**

```json
{
  "rating": 5,  // Rating from 1 to 5
  "content": "Great coaching session! Very helpful!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Rating added successfully",
  "data": {
    "id": 1,
    "coach_id": 1,
    "smoker_id": 2,
    "rating": 5,
    "content": "Great coaching session! Very helpful!",
    "created_at": "2025-07-07T16:00:00"
  }
}
```

## Error Responses

### Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null
}
```

### Not Found

```json
{
  "success": false,
  "message": "Appointment not found",
  "data": null
}
```

### Bad Request

```json
{
  "success": false,
  "message": "Missing required field: coach_id",
  "data": null
}
```

### Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to access this appointment",
  "data": null
}
```

## Status Values

Appointments can have the following status values:

- `pending`: Appointment has been created but not confirmed by coach
- `confirmed`: Coach has confirmed the appointment
- `cancelled`: Appointment has been cancelled by either user or coach
- `completed`: Appointment has been completed

## Testing

You can use the provided test script to test all API endpoints:

```
node server/test-appointment-api.js
```

The test script will guide you through the process of creating, viewing, updating, cancelling, and rating appointments.

## Testing with Postman

### Setting Up Postman

1. Download and install Postman from [postman.com](https://www.postman.com/downloads/)
2. Create a new collection named "Appointment API"
3. Set up environment variables:
   - Click on the "Environments" tab
   - Create a new environment called "NoSmoke API"
   - Add the following variables:
     - `base_url` with initial value `http://localhost:5000` (adjust port if necessary)
     - `token` with an empty initial value

### Authentication

Before testing appointment endpoints, you need to authenticate:

1. Create a new request:
   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (raw JSON):
   ```json
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

2. Send the request and from the response, copy the token value
3. Set the `token` environment variable with the copied token
4. Create a collection authorization:
   - Click on your "Appointment API" collection
   - Go to the "Authorization" tab
   - Type: "Bearer Token"
   - Token: `{{token}}`

### Testing Endpoints

#### 1. Create Appointment

- Method: POST
- URL: `{{base_url}}/api/appointments`
- Body (raw JSON):
```json
{
  "coach_id": 1,
  "appointment_time": "2025-07-20T14:00:00",
  "duration_minutes": 30
}
```

#### 2. Get User's Appointments

- Method: GET
- URL: `{{base_url}}/api/appointments/user`

#### 3. Get Specific Appointment

- Method: GET
- URL: `{{base_url}}/api/appointments/1` (replace 1 with actual appointment ID)

#### 4. Update Appointment

- Method: PUT
- URL: `{{base_url}}/api/appointments/1` (replace 1 with actual appointment ID)
- Body (raw JSON):
```json
{
  "appointment_time": "2025-07-21T15:00:00",
  "duration_minutes": 45
}
```

#### 5. Cancel Appointment

- Method: PUT
- URL: `{{base_url}}/api/appointments/1/cancel` (replace 1 with actual appointment ID)

#### 6. Rate Appointment

- Method: POST
- URL: `{{base_url}}/api/appointments/1/rating` (replace 1 with actual appointment ID)
- Body (raw JSON):
```json
{
  "rating": 5,
  "content": "Great coaching session! Very helpful!"
}
```

#### 7. Delete Appointment

- Method: DELETE
- URL: `{{base_url}}/api/appointments/1` (replace 1 with actual appointment ID)

### Tips for Testing

1. After creating an appointment, save the returned ID for use in subsequent requests
2. For coach-specific actions, you may need to login with a coach account
3. To test the rating system, ensure the appointment status is "completed"
4. Use Postman's "Tests" tab to automate token extraction and appointment ID storage
