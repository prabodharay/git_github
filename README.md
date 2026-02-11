# LoadEx Backend (Firebase + Express.js)

Production-ready backend scaffold for **Firebase Phone OTP authentication** and logistics operations.

## Features

- Signup with phone number (Firebase OTP send)
- OTP verification with Firebase Identity Toolkit
- Auto-create/update `users/{uid}` document in Firestore with role
- Issue secure JWT access + refresh tokens
- Session security with revocable server-side `sessions` collection
- Role-based routing for customer / driver / admin APIs

## Project Structure

```text
.
├── .env.example
├── .gitignore
├── package.json
├── docs/
│   └── LoadEx_SRS.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── env.js
    │   └── firebase.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   └── role.middleware.js
    ├── models/
    │   ├── booking.model.js
    │   ├── driver.model.js
    │   ├── pricing.model.js
    │   ├── session.model.js
    │   ├── user.model.js
    │   └── wallet.model.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.routes.js
    │   ├── booking.routes.js
    │   ├── pricing.routes.js
    │   ├── admin/
    │   │   └── routes.js
    │   ├── customer/
    │   │   └── routes.js
    │   └── driver/
    │       └── routes.js
    ├── services/
    │   ├── auth.service.js
    │   ├── booking.service.js
    │   ├── driver-assignment.service.js
    │   └── fare.service.js
    └── utils/
        ├── geo.js
        ├── http.js
        └── jwt.js
```

## Environment

Copy `.env.example` to `.env` and set:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_WEB_API_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL` (default `15m`)
- `JWT_REFRESH_TTL` (default `30d`)

## Phone OTP Auth Flow

### 1) Signup Phone (send OTP)

`POST /api/v1/auth/signup-phone`

```json
{
  "phoneNumber": "+919999999999",
  "recaptchaToken": "recaptcha-or-app-attest-token",
  "role": "customer"
}
```

Response contains `sessionInfo`.

### 2) Verify OTP

`POST /api/v1/auth/verify-otp`

```json
{
  "sessionInfo": "from-signup-response",
  "otpCode": "123456",
  "role": "customer"
}
```

Response:

- creates/updates Firestore `users/{uid}`
- creates secure server-side session document
- returns `accessToken` + `refreshToken`

### 3) Refresh Access Token

`POST /api/v1/auth/refresh-token`

```json
{ "refreshToken": "..." }
```

### 4) Logout (revoke session)

`POST /api/v1/auth/logout`

Header:

```text
Authorization: Bearer <accessToken>
```

## Firestore Collections

- `users/{uid}`: profile + role + status
- `sessions/{sessionId}`: active/revoked login sessions
- `drivers/{driverId}`
- `bookings/{bookingId}`
- `pricing_rules/{vehicleType}`
- `wallets/{driverId}`

## Secure Sessions

- Access token is short-lived JWT (`JWT_ACCESS_TTL`)
- Refresh token is long-lived JWT (`JWT_REFRESH_TTL`)
- Every token includes `sessionId`
- Middleware checks session state in Firestore
- Logout revokes session server-side

## Run

```bash
npm install
npm run dev
```

## Firestore Schema Definitions, Validation, and Indexes

- Runtime schema definitions: `src/schemas/firestore.schemas.js`
- Validation helpers: `src/helpers/firestore-schema.helpers.js`
- JSON schema output + sample documents: `docs/firestore_schema_output.json`
- Firestore composite indexes: `firestore.indexes.json`

### Included Collections

- `users`
- `drivers`
- `bookings`
- `pricing_rules`
- `wallets`
- `transactions`

### Model-level Validation Coverage

- `UserModel.upsert()` validates against `users` schema.
- `DriverModel.update()` validates merged payload against `drivers` schema.
- `BookingModel.create()/update()` validates against `bookings` schema.
- `PricingModel.upsert()` validates against `pricing_rules` schema.
- `WalletModel.credit()` validates the computed wallet document.
- `TransactionModel.create()` validates transaction payload and supports list by driver.


### Booking Management APIs

- `POST /api/v1/bookings` (customer)
  - Creates booking with pickup, drop, vehicle type.
  - Auto-calculates fare from `pricing_rules`.
  - Auto-assigns nearest available driver.
  - Returns booking + fare breakdown + assignment details.

- `POST /api/v1/bookings/:bookingId/assign-driver` (admin)
  - Tries assignment for pending bookings.

- `PATCH /api/v1/bookings/:bookingId/status` (customer/driver/admin)
  - Updates booking status.
  - Customer is restricted to cancellation.

- `GET /api/v1/bookings/:bookingId/status` (authenticated)
  - Returns booking status payload.

- `GET /api/v1/bookings` (authenticated)
  - Returns bookings list by role:
    - customer: own bookings
    - driver: assigned bookings
    - admin: all bookings
