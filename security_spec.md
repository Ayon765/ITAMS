# Security Specification

## Data Invariants
1. Application state documents must have valid IDs.
2. Unmatched collections are denied by default catch-all.

## The Dirty Dozen Payloads
1. Oversized document ID injection (>128 chars)
2. Invalid character injection in document ID
3. Unauthenticated access to private system collections

## Test Runner
Verified via firestore.rules.test.ts
