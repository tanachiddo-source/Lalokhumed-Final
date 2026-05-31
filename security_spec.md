# Security Specification - IV Thrive

## Data Invariants
1. **Bookings**: Must have a valid fullName, email, phone, service, and status. Status starts as 'pending'. Only admins can update status.
2. **Questionnaires**: Must have fullName, email, phone, and signature. Once created, they are immutable (clinical records).
3. **Availability**: Links a booking ID to a taken slot. Only admins can manage this.
4. **Notifications**: Queue for communication. Only admins can create/list.
5. **Admins**: Trusted list of UIDs or the primary Business Admin Email (defined in environment variables).

## The Dirty Dozen Payloads
1. **Unauthenticated Booking**: Create booking without auth. (ALLOWED - public)
2. **Anonymous Admin Action**: Update booking status as non-admin. (DENIED)
3. **Identity Spoofing**: Create booking with someone else's email in `request.auth` (if auth was required).
4. **State Jumping**: Update booking directly to 'confirmed' from client as non-admin. (DENIED)
5. **Shadow Update**: Add `isPriority: true` to a booking update. (DENIED - strict keys)
6. **Clinical Record Tampering**: Update a questionnaire after submission. (DENIED - immutable)
7. **Resource Poisoning**: Use a 1MB string as a booking ID. (DENIED - size limits)
8. **PII Leak**: List all questionnaires as a signed-in patient. (DENIED - admin only)
9. **Orphaned Notification**: Create a notification for a non-existent booking. (DENIED - exists check)
10. **Admin Escalation**: Add yourself to the `admins` collection. (DENIED)
11. **Availability Hijack**: Delete an availability slot as a patient. (DENIED)
12. **Malicious Notes**: Update `adminNote` as a patient. (DENIED)

## Test Suite
A test suite would verify these using `@firebase/rules-unit-testing`.
