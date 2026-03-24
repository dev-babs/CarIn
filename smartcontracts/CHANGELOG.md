# Changelog

All notable changes to the CarIn smart contracts will be documented in this file.

## [Unreleased]

### Added - Dispute Resolution System
- **DisputeResolution Contract**: Comprehensive dispute resolution system with automated and manual resolution
- **Check-in/Check-out Tracking**: Added timestamp tracking to ParkingSpot contract
- **Evidence Submission**: IPFS-based evidence storage with multiple evidence types
- **Automated Resolution**: Automatic dispute resolution based on timestamps (no-show, late check-in, early check-out)
- **Voting Mechanism**: Authorized voter system for complex disputes
- **Manual Resolution**: Moderator interface for manual dispute resolution
- **Comprehensive Testing**: Unit tests, integration tests, and edge case coverage

### Changed
- **ParkingSpot Contract**: Added `checkInTime` and `checkOutTime` fields to Booking struct
- **PaymentEscrow Contract**: Added `getDisputeByEscrowId` helper method
- **IParkingSpot Interface**: Updated Booking struct with missing fields

### Security
- Reentrancy protection on all state-changing functions
- Access control with role-based permissions
- Evidence hash verification
- Timestamp validation

## [2.0.0] - Previous Release
- Rewards Token System
- Enhanced Payment Escrow
- Booking System




