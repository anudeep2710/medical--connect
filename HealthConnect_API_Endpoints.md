# HealthConnect API Endpoints Documentation

## 1. User Authentication API

### `/api/auth/login` (POST)
- **Operation**: User login
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "string",
    "rememberMe": "boolean (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "PATIENT | DOCTOR",
    "token": "string",
    "avatar": "string (optional)",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)",
    "yearsOfExperience": "number (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/auth/register` (POST)
- **Operation**: User registration
- **Request Body**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "password": "string",
    "role": "PATIENT | DOCTOR",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "PATIENT | DOCTOR",
    "token": "string",
    "avatar": "string (optional)",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)",
    "yearsOfExperience": "number (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

## 2. Appointments API

### `/api/appointments` (GET)
- **Operation**: Get appointments with filtering
- **Query Parameters**:
  ```
  status: string (optional)
  type: string (optional)
  startDate: string (optional)
  endDate: string (optional)
  ```
- **Response Body**:
  ```json
  [
    {
      "id": "number",
      "doctor": {
        "id": "number",
        "fullName": "string",
        "email": "string",
        "specialization": "string",
        "avatar": "string (optional)",
        "affiliation": "string (optional)",
        "yearsOfExperience": "number (optional)"
      },
      "patient": {
        "id": "number",
        "fullName": "string",
        "email": "string",
        "avatar": "string (optional)"
      },
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "status": "CONFIRMED | PENDING | COMPLETED | CANCELLED",
      "type": "IN_PERSON | VIDEO_CALL",
      "reasonForVisit": "string (optional)",
      "notes": "string (optional)",
      "meetingLink": "string (optional)",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### `/api/appointments/{id}` (GET)
- **Operation**: Get appointment by ID
- **Path Parameters**: id (number)
- **Response Body**:
  ```json
  {
    "id": "number",
    "doctor": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "specialization": "string",
      "avatar": "string (optional)",
      "affiliation": "string (optional)",
      "yearsOfExperience": "number (optional)"
    },
    "patient": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "avatar": "string (optional)"
    },
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "status": "CONFIRMED | PENDING | COMPLETED | CANCELLED",
    "type": "IN_PERSON | VIDEO_CALL",
    "reasonForVisit": "string (optional)",
    "notes": "string (optional)",
    "meetingLink": "string (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/appointments` (POST)
- **Operation**: Create a new appointment
- **Request Body**:
  ```json
  {
    "doctorId": "number",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "type": "IN_PERSON | VIDEO_CALL",
    "reasonForVisit": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "number",
    "doctor": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "specialization": "string",
      "avatar": "string (optional)",
      "affiliation": "string (optional)",
      "yearsOfExperience": "number (optional)"
    },
    "patient": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "avatar": "string (optional)"
    },
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "status": "CONFIRMED | PENDING | COMPLETED | CANCELLED",
    "type": "IN_PERSON | VIDEO_CALL",
    "reasonForVisit": "string (optional)",
    "notes": "string (optional)",
    "meetingLink": "string (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/appointments/{id}` (PUT)
- **Operation**: Update an existing appointment
- **Path Parameters**: id (number)
- **Request Body**:
  ```json
  {
    "date": "string (optional)",
    "startTime": "string (optional)",
    "endTime": "string (optional)",
    "status": "CONFIRMED | PENDING | COMPLETED | CANCELLED (optional)",
    "type": "IN_PERSON | VIDEO_CALL (optional)",
    "reasonForVisit": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "number",
    "doctor": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "specialization": "string",
      "avatar": "string (optional)",
      "affiliation": "string (optional)",
      "yearsOfExperience": "number (optional)"
    },
    "patient": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "avatar": "string (optional)"
    },
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "status": "CONFIRMED | PENDING | COMPLETED | CANCELLED",
    "type": "IN_PERSON | VIDEO_CALL",
    "reasonForVisit": "string (optional)",
    "notes": "string (optional)",
    "meetingLink": "string (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/appointments/{id}` (DELETE)
- **Operation**: Cancel appointment
- **Path Parameters**: id (number)
- **Response Body**: None (void)

### `/api/doctors/{doctorId}/time-slots` (GET)
- **Operation**: Get available time slots for a doctor
- **Path Parameters**: doctorId (number)
- **Query Parameters**:
  ```
  date: string
  ```
- **Response Body**:
  ```json
  [
    {
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "isAvailable": "boolean"
    }
  ]
  ```

### `/api/doctors` (GET)
- **Operation**: Get all doctors
- **Query Parameters**:
  ```
  specialization: string (optional)
  ```
- **Response Body**:
  ```json
  [
    {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "specialization": "string",
      "avatar": "string (optional)",
      "affiliation": "string (optional)",
      "yearsOfExperience": "number (optional)"
    }
  ]
  ```

## 3. Chat & Messaging API

### `/api/chats` (GET)
- **Operation**: Get chat list
- **Response Body**:
  ```json
  [
    {
      "id": "number",
      "participants": [
        {
          "id": "number",
          "fullName": "string",
          "avatar": "string (optional)",
          "role": "PATIENT | DOCTOR",
          "isOnline": "boolean (optional)",
          "lastSeen": "string (optional)"
        }
      ],
      "lastMessage": {
        "id": "number",
        "chatId": "number",
        "senderId": "number",
        "text": "string",
        "isRead": "boolean",
        "createdAt": "string"
      },
      "unreadCount": "number"
    }
  ]
  ```

### `/api/chats/{chatId}/messages` (GET)
- **Operation**: Get messages for a chat
- **Path Parameters**: chatId (number)
- **Query Parameters**:
  ```
  page: number (optional, default: 0)
  size: number (optional, default: 20)
  ```
- **Response Body**:
  ```json
  [
    {
      "id": "number",
      "chatId": "number",
      "senderId": "number",
      "text": "string",
      "isRead": "boolean",
      "createdAt": "string"
    }
  ]
  ```

### `/api/chats/{chatId}/messages` (POST)
- **Operation**: Send a message
- **Path Parameters**: chatId (number)
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "number",
    "chatId": "number",
    "senderId": "number",
    "text": "string",
    "isRead": "boolean",
    "createdAt": "string"
  }
  ```

### `/api/chats/{chatId}/read` (PUT)
- **Operation**: Mark messages as read
- **Path Parameters**: chatId (number)
- **Response Body**: None (void)

### `/api/chats/with-user/{userId}` (POST)
- **Operation**: Get or create chat with a user
- **Path Parameters**: userId (number)
- **Request Body**: Empty object `{}`
- **Response Body**:
  ```json
  {
    "id": "number",
    "participants": [
      {
        "id": "number",
        "fullName": "string",
        "avatar": "string (optional)",
        "role": "PATIENT | DOCTOR",
        "isOnline": "boolean (optional)",
        "lastSeen": "string (optional)"
      }
    ],
    "lastMessage": {
      "id": "number",
      "chatId": "number",
      "senderId": "number",
      "text": "string",
      "isRead": "boolean",
      "createdAt": "string"
    },
    "unreadCount": "number"
  }
  ```

## 4. Video Call API

### `/api/video-calls/appointment/{appointmentId}` (GET)
- **Operation**: Get appointment details for a video call
- **Path Parameters**: appointmentId (number)
- **Response Body**: Appointment details (structure not fully specified in code)

### `/api/video-calls/appointment/{appointmentId}/record/start` (POST)
- **Operation**: Start recording a call session
- **Path Parameters**: appointmentId (number)
- **Response Body**:
  ```json
  {
    "recordingId": "string"
  }
  ```

### `/api/video-calls/appointment/{appointmentId}/record/stop` (POST)
- **Operation**: Stop recording
- **Path Parameters**: appointmentId (number)
- **Request Body**:
  ```json
  {
    "recordingId": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "recordingUrl": "string"
  }
  ```

## 5. Health Bot API

### `/api/health-bot/message` (POST)
- **Operation**: Send message to health bot
- **Request Body**:
  ```json
  {
    "message": "string",
    "history": [
      {
        "id": "string",
        "role": "user | assistant",
        "content": "string",
        "timestamp": "Date"
      }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "string",
    "role": "user | assistant",
    "content": "string",
    "timestamp": "Date"
  }
  ```

### `/api/health-bot/analyze` (POST)
- **Operation**: Get health recommendations based on analysis
- **Request Body**:
  ```json
  {
    "conversation": [
      {
        "id": "string",
        "role": "user | assistant",
        "content": "string",
        "timestamp": "Date"
      }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "severity": "low | medium | high",
    "conditions": [
      {
        "name": "string",
        "confidence": "number"
      }
    ],
    "advice": "string",
    "seekMedicalAttention": "boolean"
  }
  ```

### `/api/health-bot/share/{doctorId}` (POST)
- **Operation**: Share conversation with a doctor
- **Path Parameters**: doctorId (number)
- **Request Body**:
  ```json
  {
    "conversation": [
      {
        "id": "string",
        "role": "user | assistant",
        "content": "string",
        "timestamp": "Date"
      }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "success": "boolean"
  }
  ```

## 6. User Profile API

### `/api/users/me` (GET)
- **Operation**: Get current user profile
- **Response Body**:
  ```json
  {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "PATIENT | DOCTOR",
    "avatar": "string (optional)",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)",
    "yearsOfExperience": "number (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/users/me` (PUT)
- **Operation**: Update user profile
- **Request Body**:
  ```json
  {
    "fullName": "string (optional)",
    "email": "string (optional)",
    "avatar": "string (optional)",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)",
    "yearsOfExperience": "number (optional)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "PATIENT | DOCTOR",
    "avatar": "string (optional)",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)",
    "yearsOfExperience": "number (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/users/me/password` (PUT)
- **Operation**: Update user password
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response Body**: None (void)

### `/api/users/me/health-statistics` (GET)
- **Operation**: Get health statistics for patient
- **Response Body**: Health statistics (structure not fully specified in code)

### `/api/doctors/{id}` (GET)
- **Operation**: Get doctor by ID
- **Path Parameters**: id (number)
- **Response Body**:
  ```json
  {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "DOCTOR",
    "avatar": "string (optional)",
    "specialization": "string (optional)",
    "licenseNumber": "string (optional)",
    "affiliation": "string (optional)",
    "yearsOfExperience": "number (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/patients/{id}` (GET)
- **Operation**: Get patient by ID
- **Path Parameters**: id (number)
- **Response Body**:
  ```json
  {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "PATIENT",
    "avatar": "string (optional)",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### `/api/doctors/me/patients` (GET)
- **Operation**: Get list of patients for doctor
- **Response Body**:
  ```json
  [
    {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "role": "PATIENT",
      "avatar": "string (optional)",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### `/api/patients/me/doctors` (GET)
- **Operation**: Get list of doctors for patient
- **Response Body**:
  ```json
  [
    {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "role": "DOCTOR",
      "avatar": "string (optional)",
      "specialization": "string (optional)",
      "licenseNumber": "string (optional)",
      "affiliation": "string (optional)",
      "yearsOfExperience": "number (optional)",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```
