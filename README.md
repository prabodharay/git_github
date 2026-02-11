# LoadEx Backend (Firebase + Express.js)

Complete mobile backend project scaffold for LoadEx logistics app with:

- Firebase Phone OTP authentication flow (token verification)
- Firestore models for users, bookings, drivers, pricing rules, wallets
- REST APIs for login, fare calculation, booking creation, and driver assignment flow
- Role-based routing for customer, driver, admin
- Environment-based configuration

## Tech Stack

- Node.js + Express
- Firebase Admin SDK (Auth + Firestore)
- Firestore as primary database

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
        └── http.js
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy env and fill values

```bash
cp .env.example .env
```

3. Run in dev mode

```bash
npm run dev
```

## Environment Variables

See `.env.example`:

- `PORT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `PLATFORM_FEE`
- `DEFAULT_SURGE_MULTIPLIER`
- `DRIVER_MATCH_RADIUS_KM`

## Firestore Collections (Data Models)

- `users/{uid}`
  - `role`: customer | driver | admin
  - `phone`
  - `status`
  - `createdAt`, `updatedAt`

- `drivers/{driverId}`
  - `name`
  - `vehicleType`
  - `status`: approved/rejected/suspended
  - `availability`: available/busy
  - `location`: `{ lat, lng }`

- `bookings/{bookingId}`
  - `customerId`, `driverId`
  - `pickupLocation`, `dropLocation`
  - `distanceKm`, `vehicleType`
  - `fare`, `status`
  - `loadDescription`, `loadPhotos`

- `pricing_rules/{vehicleType}`
  - `baseFare`
  - `perKmRate`
  - `surgeMultiplier`

- `wallets/{driverId}`
  - `balance`
  - `totalEarnings`

## API Endpoints

Base URL: `/api/v1`

### Authentication

- `POST /auth/login`
  - Body: `{ "idToken": "<firebase-id-token>", "role": "customer|driver|admin" }`
  - Verifies Firebase token from Phone OTP flow and creates/updates user profile.

### Pricing / Fare

- `POST /pricing/fare/calculate` (authenticated)
  - Body: `{ "vehicleType": "mini_truck", "distanceKm": 12.5 }`

- `POST /pricing/pricing/:vehicleType` (admin)
  - Body: `{ "baseFare": 100, "perKmRate": 18, "surgeMultiplier": 1.2 }`

### Booking

- `POST /bookings` (customer)
  - Body:
    ```json
    {
      "pickupLocation": { "lat": 19.1, "lng": 72.9 },
      "dropLocation": { "lat": 19.2, "lng": 73.0 },
      "distanceKm": 14,
      "vehicleType": "mini_truck",
      "loadDescription": "Furniture",
      "loadPhotos": []
    }
    ```
  - Automatically calculates fare and tries nearest driver assignment.

- `GET /bookings/:bookingId` (customer/driver/admin with access)

### Driver Routes

- `PATCH /driver/bookings/:bookingId/status` (driver)
  - Body: `{ "status": "arrived|started|completed|cancelled|accepted" }`

### Admin Routes

- `PATCH /admin/drivers/:driverId/approval` (admin)
  - Body: `{ "status": "approved|rejected|suspended" }`

## Role-Based Routing

- Customer-only routes under `/customer` and booking creation restrictions.
- Driver-only routes under `/driver`.
- Admin-only routes under `/admin` and pricing update endpoint.

## Notes for Mobile Integration

- Phone OTP sending/verification is handled by Firebase client SDK in mobile app.
- Backend receives Firebase ID token and verifies it with Admin SDK.
- Use `Authorization: Bearer <idToken>` for protected APIs.
