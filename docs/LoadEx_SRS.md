# Software Requirements Specification (SRS)

## Project: LoadEx – Logistics Aggregator Platform

## 1. Introduction

### 1.1 Purpose

LoadEx is a logistics marketplace platform connecting:

- Customers needing goods transport
- Commercial vehicle drivers
- Admin operators managing pricing and compliance

The system consists of:

- Flutter Mobile App (Customer + Driver)
- Web Admin Dashboard (React / Next.js)
- Firebase Backend

## 2. System Architecture

### 2.1 Technology Stack

#### Mobile App

- Flutter (Dart)
- Firebase SDK

#### Backend

- Firebase Authentication (Phone OTP)
- Cloud Firestore
- Cloud Functions (Node.js)
- Firebase Storage
- Firebase Cloud Messaging (Push)

#### Admin Panel

- React / Next.js
- Firebase Admin SDK

#### Payment Integration

- Razorpay / PhonePe UPI
- Webhook verification via Cloud Functions

## 3. User Roles

### 3.1 Customer

- Login via OTP
- Create booking
- Live track driver
- Upload load photos
- Make payment
- View history
- Download invoice

### 3.2 Driver

- OTP login
- Submit KYC documents
- Accept / reject booking
- Update trip status
- Upload before/after photos
- View wallet balance
- Request payout

### 3.3 Admin

- Approve drivers
- Manage pricing rules
- View live bookings
- Monitor revenue
- Trigger payouts
- Suspend users

## 4. Functional Requirements

### 4.1 Authentication Module

#### 4.1.1 Phone OTP Login

System must:

- Send OTP via Firebase Auth
- Verify OTP
- Create user record in Firestore

Firestore collection:

```text
users/
   uid/
      role: customer | driver | admin
      phone
      createdAt
      status
```

### 4.2 Booking Module

#### 4.2.1 Create Booking

Customer must provide:

- Pickup location
- Drop location
- Vehicle type
- Load description
- Load photos (optional)

Firestore structure:

```text
bookings/
   bookingId/
      customerId
      driverId
      pickupLocation
      dropLocation
      distanceKm
      vehicleType
      fare
      status
      createdAt
```

#### 4.2.2 Booking Status Flow

Status values:

- pending
- accepted
- arrived
- started
- completed
- cancelled

### 4.3 Pricing Engine

Pricing must be calculated via Cloud Function.

Pricing formula:

```text
fare = baseFare(vehicleType)
     + (distanceKm × perKmRate)
     + platformFee
     + surgeMultiplier
```

Pricing rules stored in:

```text
pricing_rules/
   vehicleType/
      baseFare
      perKmRate
      surgeMultiplier
```

Cloud Function:

- `calculateFare()`

### 4.4 Driver Matching

When a booking is created, Cloud Function `assignDriver()` executes.

Logic:

- Find nearest available driver
- Match by vehicle type
- Send FCM notification

### 4.5 Wallet System

#### 4.5.1 Driver Wallet

Firestore:

```text
wallets/
   driverId/
      balance
      totalEarnings
```

Transactions:

```text
transactions/
   transactionId/
      driverId
      bookingId
      amount
      type (credit/debit)
      createdAt
```

### 4.6 Payment Module

Payment flow:

- Create order via Cloud Function
- Call Razorpay API
- Payment success callback
- Verify webhook
- Update booking status to paid
- Credit driver wallet

### 4.7 Photo Storage

Photos stored in Firebase Storage:

```text
load_photos/{bookingId}/before/
load_photos/{bookingId}/after/
```

### 4.8 Push Notifications

Use Firebase Cloud Messaging.

Triggers:

- Booking assigned
- Driver arrived
- Trip started
- Trip completed
- Payment success

## 5. Database Design

Collections overview:

- users
- drivers
- bookings
- pricing_rules
- wallets
- transactions
- kyc_documents
- corporate_accounts

## 6. Security Requirements

### 6.1 Firestore Rules

- Customer can only read own bookings
- Driver can only read assigned bookings
- Admin has full access
- Pricing rules read-only for users

## 7. Non-Functional Requirements

### Performance

- Booking creation < 2 sec
- OTP verification < 5 sec

### Scalability

- Support 10,000+ daily bookings

### Availability

- 99.5% uptime

## 8. Future Enhancements

- Insurance integration
- Multi-point delivery
- Corporate dashboard
- Route optimization using AI
- Demand surge AI model

## 9. Folder Structure (Flutter Clean Architecture)

```text
lib/
   core/
   data/
      models/
      repositories/
   domain/
      entities/
      usecases/
   presentation/
      screens/
      widgets/
```

## 10. Deployment Plan

### Mobile App

- Play Store
- App Store

### Backend

- Firebase Blaze Plan

## 11. Test Cases

- OTP failure
- Payment failure
- No driver available
- Network disconnect
- Multi-booking scenario

## 12. Success Metrics

- Booking success rate > 95%
- Driver acceptance rate > 70%
- Payment failure < 2%

## Result

This SRS is sufficient to:

- Build full Flutter app
- Generate backend via AI tools
- Deploy production version
