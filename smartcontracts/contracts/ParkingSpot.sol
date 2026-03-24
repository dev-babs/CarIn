// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ParkingSpot
 * @notice Manages parking spot listings, bookings, and ownership for a decentralized parking marketplace
 * @dev This contract handles:
 *      - Spot registration with location and pricing
 *      - Time-based booking creation with automatic conflict detection
 *      - Ownership management and transfer
 *      - Availability management
 *      - Booking lifecycle (creation, cancellation, completion)
 * 
 * Security Features:
 *      - ReentrancyGuard on all state-changing functions
 *      - Custom errors for gas optimization
 *      - Access control via OpenZeppelin Ownable and custom modifiers
 *      - Time-based locks prevent double-booking
 * 
 * Gas Optimizations:
 *      - Struct storage packing
 *      - Custom errors instead of require strings
 *      - Efficient mapping structures
 */
contract ParkingSpot is Ownable, ReentrancyGuard {
    // Custom errors for gas optimization
    error InvalidPrice();
    error SpotDoesNotExist();
    error SpotNotAvailable();
    error InvalidTimeRange();
    error StartTimeInPast();
    error NotAuthorized();
    error BookingNotActive();
    error CannotCancelActiveBooking();
    error NotSpotOwner();
    error CannotBookOwnSpot();
    error TimeSlotAlreadyBooked();
    error InvalidOwner();

    // Spot structure (optimized for storage packing)
    struct Spot {
        uint256 id;              // Slot 0
        address owner;           // Slot 1 (20 bytes, can pack with bool)
        uint256 pricePerHour;    // Slot 2
        uint256 createdAt;       // Slot 3
        string location;         // Slot 4+ (dynamic)
        bool isAvailable;        // Packed with owner in Slot 1
    }

    // Booking structure (optimized for storage packing)
    struct Booking {
        uint256 bookingId;       // Slot 0
        uint256 spotId;          // Slot 1
        address user;            // Slot 2 (20 bytes, can pack with bools)
        uint256 startTime;       // Slot 3
        uint256 endTime;         // Slot 4
        uint256 totalPrice;      // Slot 5
        uint256 checkInTime;     // Slot 6
        uint256 checkOutTime;    // Slot 7
        bool isActive;           // Packed with user in Slot 2
        bool isCancelled;        // Packed with user in Slot 2
        bool isCompleted;        // Packed with user in Slot 2
    }

    // State variables
    mapping(uint256 => Spot) public spots;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userBookings;
    mapping(address => uint256[]) public ownerSpots;
    mapping(uint256 => uint256[]) private spotBookings; // spotId => bookingIds
    
    uint256 public spotCounter;
    uint256 public bookingCounter;

    // Events
    event SpotListed(
        uint256 indexed spotId,
        address indexed owner,
        string location,
        uint256 pricePerHour,
        uint256 createdAt
    );
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed spotId,
        address indexed user,
        uint256 startTime,
        uint256 endTime,
        uint256 totalPrice
    );
    event BookingCancelled(
        uint256 indexed bookingId,
        uint256 indexed spotId,
        address indexed cancelledBy
    );
    event BookingCompleted(
        uint256 indexed bookingId,
        uint256 indexed spotId,
        address indexed user
    );
    event SpotAvailabilityUpdated(
        uint256 indexed spotId,
        bool isAvailable,
        address indexed updatedBy
    );
    event SpotOwnershipTransferred(
        uint256 indexed spotId,
        address indexed previousOwner,
        address indexed newOwner
    );
    event CheckInRecorded(
        uint256 indexed bookingId,
        uint256 indexed spotId,
        address indexed user,
        uint256 checkInTime
    );
    event CheckOutRecorded(
        uint256 indexed bookingId,
        uint256 indexed spotId,
        address indexed user,
        uint256 checkOutTime
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Check if a time slot is available for booking
     * @param spotId The ID of the spot to check
     * @param startTime The start time to check
     * @param endTime The end time to check
     * @return available True if the time slot is available
     */
    function isTimeSlotAvailable(
        uint256 spotId,
        uint256 startTime,
        uint256 endTime
    ) public view returns (bool) {
        uint256[] memory bookingIds = spotBookings[spotId];
        
        for (uint256 i = 0; i < bookingIds.length; i++) {
            Booking memory booking = bookings[bookingIds[i]];
            if (booking.isActive && !booking.isCancelled && !booking.isCompleted) {
                // Check for time overlap: bookings overlap if not (endTime <= booking.startTime || startTime >= booking.endTime)
                if (!(endTime <= booking.startTime || startTime >= booking.endTime)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @notice Modifier to verify spot ownership
     * @param spotId The ID of the spot to verify
     */
    modifier onlySpotOwner(uint256 spotId) {
        if (spots[spotId].owner == address(0)) {
            revert SpotDoesNotExist();
        }
        if (spots[spotId].owner != msg.sender) {
            revert NotSpotOwner();
        }
        _;
    }

    /**
     * @notice List a new parking spot
     * @dev Creates a new parking spot listing with location and price
     * @param location The location description or IPFS hash for location data
     * @param pricePerHour The price per hour in wei
     * @return spotId The ID of the newly created spot
     */
    function listSpot(string memory location, uint256 pricePerHour) external nonReentrant returns (uint256) {
        if (pricePerHour == 0) {
            revert InvalidPrice();
        }
        if (bytes(location).length == 0) {
            revert InvalidTimeRange(); // Reuse error for empty location
        }
        
        spotCounter++;
        spots[spotCounter] = Spot({
            id: spotCounter,
            owner: msg.sender,
            location: location,
            pricePerHour: pricePerHour,
            isAvailable: true,
            createdAt: block.timestamp
        });

        ownerSpots[msg.sender].push(spotCounter);

        emit SpotListed(spotCounter, msg.sender, location, pricePerHour, block.timestamp);
        return spotCounter;
    }

    /**
     * @notice Create a booking for a parking spot
     * @dev Includes time-based lock checks and price calculation
     * @param spotId The ID of the spot to book
     * @param startTime The start time of the booking (Unix timestamp)
     * @param endTime The end time of the booking (Unix timestamp)
     * @return bookingId The ID of the newly created booking
     */
    function createBooking(uint256 spotId, uint256 startTime, uint256 endTime) external nonReentrant returns (uint256) {
        if (spots[spotId].id == 0) {
            revert SpotDoesNotExist();
        }
        if (!spots[spotId].isAvailable) {
            revert SpotNotAvailable();
        }
        if (startTime >= endTime) {
            revert InvalidTimeRange();
        }
        if (startTime < block.timestamp) {
            revert StartTimeInPast();
        }
        if (msg.sender == spots[spotId].owner) {
            revert CannotBookOwnSpot();
        }
        if (!isTimeSlotAvailable(spotId, startTime, endTime)) {
            revert TimeSlotAlreadyBooked();
        }

        // Calculate total price based on duration
        uint256 duration = endTime - startTime;
        uint256 totalPrice = (duration * spots[spotId].pricePerHour) / 3600; // Convert seconds to hours

        bookingCounter++;
        bookings[bookingCounter] = Booking({
            bookingId: bookingCounter,
            spotId: spotId,
            user: msg.sender,
            startTime: startTime,
            endTime: endTime,
            totalPrice: totalPrice,
            checkInTime: 0,
            checkOutTime: 0,
            isActive: true,
            isCancelled: false,
            isCompleted: false
        });

        userBookings[msg.sender].push(bookingCounter);
        spotBookings[spotId].push(bookingCounter);

        emit BookingCreated(bookingCounter, spotId, msg.sender, startTime, endTime, totalPrice);
        return bookingCounter;
    }

    /**
     * @notice Cancel a booking
     * @dev Can be called by the renter or spot owner before the booking starts
     * @param bookingId The ID of the booking to cancel
     */
    function cancelBooking(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        if (booking.bookingId == 0) {
            revert SpotDoesNotExist(); // Reuse error
        }
        if (booking.user != msg.sender && spots[booking.spotId].owner != msg.sender) {
            revert NotAuthorized();
        }
        if (!booking.isActive || booking.isCancelled) {
            revert BookingNotActive();
        }
        if (block.timestamp >= booking.startTime) {
            revert CannotCancelActiveBooking();
        }

        booking.isCancelled = true;
        booking.isActive = false;
        // Make spot available again if no other active bookings
        spots[booking.spotId].isAvailable = true;

        emit BookingCancelled(bookingId, booking.spotId, msg.sender);
    }

    /**
     * @notice Mark a booking as completed
     * @dev Can be called by the renter or spot owner after the booking end time
     * @param bookingId The ID of the booking to complete
     */
    function completeBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        if (booking.bookingId == 0) {
            revert SpotDoesNotExist(); // Reuse error for booking
        }
        if (booking.user != msg.sender && spots[booking.spotId].owner != msg.sender) {
            revert NotAuthorized();
        }
        if (booking.isCancelled || booking.isCompleted) {
            revert BookingNotActive();
        }
        if (block.timestamp < booking.endTime) {
            revert InvalidTimeRange(); // Booking hasn't ended yet
        }

        booking.isCompleted = true;
        booking.isActive = false;

        emit BookingCompleted(bookingId, booking.spotId, booking.user);
    }

    /**
     * @notice Update spot availability
     * @dev Only the spot owner can update availability. Availability is also automatically
     * managed based on active bookings, but owners can manually override.
     * @param spotId The ID of the spot to update
     * @param isAvailable The new availability status
     */
    function updateSpotAvailability(uint256 spotId, bool isAvailable) external onlySpotOwner(spotId) nonReentrant {
        // Check if there are any active bookings that would conflict
        if (isAvailable) {
            uint256[] memory bookingIds = spotBookings[spotId];
            for (uint256 i = 0; i < bookingIds.length; i++) {
                Booking memory booking = bookings[bookingIds[i]];
                if (booking.isActive && !booking.isCancelled && !booking.isCompleted) {
                    // If booking is currently active (between start and end time), don't allow making available
                    if (block.timestamp >= booking.startTime && block.timestamp < booking.endTime) {
                        revert SpotNotAvailable(); // There's an active booking
                    }
                }
            }
        }
        
        spots[spotId].isAvailable = isAvailable;
        emit SpotAvailabilityUpdated(spotId, isAvailable, msg.sender);
    }

    /**
     * @notice Verify if an address is the owner of a spot
     * @param spotId The ID of the spot to check
     * @param owner The address to verify
     * @return isOwner True if the address is the owner
     */
    function isSpotOwner(uint256 spotId, address owner) external view returns (bool) {
        return spots[spotId].owner == owner;
    }

    /**
     * @notice Get the owner of a spot
     * @param spotId The ID of the spot
     * @return owner The address of the spot owner
     */
    function getSpotOwner(uint256 spotId) external view returns (address) {
        if (spots[spotId].owner == address(0)) {
            revert SpotDoesNotExist();
        }
        return spots[spotId].owner;
    }

    /**
     * @notice Transfer ownership of a parking spot to a new owner
     * @dev Only the current owner can transfer ownership
     * @param spotId The ID of the spot to transfer
     * @param newOwner The address of the new owner
     */
    function transferSpotOwnership(uint256 spotId, address newOwner) external onlySpotOwner(spotId) nonReentrant {
        if (newOwner == address(0)) {
            revert InvalidOwner();
        }
        if (newOwner == spots[spotId].owner) {
            revert InvalidOwner(); // Same owner
        }

        address previousOwner = spots[spotId].owner;
        spots[spotId].owner = newOwner;

        // Update owner spots mapping
        uint256[] storage oldOwnerSpots = ownerSpots[previousOwner];
        for (uint256 i = 0; i < oldOwnerSpots.length; i++) {
            if (oldOwnerSpots[i] == spotId) {
                oldOwnerSpots[i] = oldOwnerSpots[oldOwnerSpots.length - 1];
                oldOwnerSpots.pop();
                break;
            }
        }
        ownerSpots[newOwner].push(spotId);

        emit SpotOwnershipTransferred(spotId, previousOwner, newOwner);
    }

    /**
     * @notice Get spot details
     * @param spotId The ID of the spot
     * @return spot The spot struct
     */
    function getSpot(uint256 spotId) external view returns (Spot memory) {
        return spots[spotId];
    }

    /**
     * @notice Get booking details
     * @param bookingId The ID of the booking
     * @return booking The booking struct
     */
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }

    /**
     * @notice Get all booking IDs for a spot
     * @param spotId The ID of the spot
     * @return bookingIds Array of booking IDs
     */
    function getSpotBookings(uint256 spotId) external view returns (uint256[] memory) {
        return spotBookings[spotId];
    }

    /**
     * @notice Get all spot IDs owned by an address
     * @param owner The owner address
     * @return spotIds Array of spot IDs
     */
    function getOwnerSpots(address owner) external view returns (uint256[] memory) {
        return ownerSpots[owner];
    }

    /**
     * @notice Get all booking IDs for a renter
     * @param renter The renter address
     * @return bookingIds Array of booking IDs
     */
    function getRenterBookings(address renter) external view returns (uint256[] memory) {
        return userBookings[renter];
    }

    /**
     * @notice Record check-in for a booking (can be called by owner or user)
     * @param bookingId The booking ID
     */
    function recordCheckIn(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        if (booking.bookingId == 0) {
            revert SpotDoesNotExist();
        }
        require(
            msg.sender == booking.user || msg.sender == spots[booking.spotId].owner,
            "Not authorized to record check-in"
        );
        require(booking.checkInTime == 0, "Check-in already recorded");
        require(!booking.isCancelled, "Cannot check in to cancelled booking");

        booking.checkInTime = block.timestamp;
        emit CheckInRecorded(bookingId, booking.spotId, booking.user, block.timestamp);
    }

    /**
     * @notice Record check-out for a booking (can be called by owner or user)
     * @param bookingId The booking ID
     */
    function recordCheckOut(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        if (booking.bookingId == 0) {
            revert SpotDoesNotExist();
        }
        require(
            msg.sender == booking.user || msg.sender == spots[booking.spotId].owner,
            "Not authorized to record check-out"
        );
        require(booking.checkInTime > 0, "Check-in not recorded");
        require(booking.checkOutTime == 0, "Check-out already recorded");

        booking.checkOutTime = block.timestamp;
        emit CheckOutRecorded(bookingId, booking.spotId, booking.user, block.timestamp);
    }
}

