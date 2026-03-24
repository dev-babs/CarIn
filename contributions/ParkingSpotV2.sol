// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ParkingSpot
 * @dev Secure, gas-optimized parking spot marketplace with booking management
 */
contract ParkingSpotV2 is Ownable, ReentrancyGuard {
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
    error CheckInRecorded();
    error CheckOutRecorded();

    struct Spot {
        address owner;
        uint256 pricePerHour;
        uint256 createdAt;
        bool isAvailable;
        string location;
    }

    struct Booking {
        uint256 spotId;
        address user;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrice;
        uint256 checkInTime;
        uint256 checkOutTime;
        bool isActive;
        bool isCancelled;
        bool isCompleted;
    }

    mapping(uint256 => Spot) public spots;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userBookings;
    mapping(address => uint256[]) public ownerSpots;
    mapping(uint256 => uint256[]) public spotBookings;

    uint256 public spotCounter;
    uint256 public bookingCounter;

    event SpotListed(uint256 indexed spotId, address indexed owner, string location, uint256 pricePerHour);
    event BookingCreated(uint256 indexed bookingId, uint256 indexed spotId, address indexed user, uint256 startTime, uint256 endTime, uint256 totalPrice);
    event BookingCancelled(uint256 indexed bookingId, uint256 indexed spotId, address indexed cancelledBy);
    event BookingCompleted(uint256 indexed bookingId, uint256 indexed spotId, address indexed user);
    event SpotAvailabilityUpdated(uint256 indexed spotId, bool isAvailable);
    event OwnershipTransferred(uint256 indexed spotId, address indexed previousOwner, address indexed newOwner);
    event CheckInRecorded(uint256 indexed bookingId, uint256 checkInTime);
    event CheckOutRecorded(uint256 indexed bookingId, uint256 checkOutTime);

    modifier onlySpotOwner(uint256 spotId) {
        if (spots[spotId].owner == address(0)) revert SpotDoesNotExist();
        if (spots[spotId].owner != msg.sender) revert NotSpotOwner();
        _;
    }

    modifier validBooking(uint256 bookingId) {
        if (bookings[bookingId].user == address(0)) revert SpotDoesNotExist();
        _;
    }

    constructor() Ownable(msg.sender) {}

    function isTimeSlotAvailable(uint256 spotId, uint256 startTime, uint256 endTime) public view returns (bool) {
        uint256[] memory bookingIds = spotBookings[spotId];
        for (uint256 i = 0; i < bookingIds.length; i++) {
            Booking memory booking = bookings[bookingIds[i]];
            if (booking.isActive && !booking.isCancelled && !booking.isCompleted) {
                if (!(endTime <= booking.startTime || startTime >= booking.endTime)) {
                    return false;
                }
            }
        }
        return true;
    }

    function listSpot(string memory location, uint256 pricePerHour) external nonReentrant returns (uint256) {
        if (pricePerHour == 0) revert InvalidPrice();
        if (bytes(location).length == 0) revert InvalidTimeRange();

        uint256 spotId = ++spotCounter;
        spots[spotId] = Spot({
            owner: msg.sender,
            pricePerHour: pricePerHour,
            createdAt: block.timestamp,
            isAvailable: true,
            location: location
        });

        ownerSpots[msg.sender].push(spotId);
        emit SpotListed(spotId, msg.sender, location, pricePerHour);
        return spotId;
    }

    function createBooking(uint256 spotId, uint256 startTime, uint256 endTime) external nonReentrant returns (uint256) {
        if (spots[spotId].owner == address(0)) revert SpotDoesNotExist();
        if (!spots[spotId].isAvailable) revert SpotNotAvailable();
        if (startTime >= endTime) revert InvalidTimeRange();
        if (startTime < block.timestamp) revert StartTimeInPast();
        if (msg.sender == spots[spotId].owner) revert CannotBookOwnSpot();
        if (!isTimeSlotAvailable(spotId, startTime, endTime)) revert TimeSlotAlreadyBooked();

        uint256 duration = endTime - startTime;
        uint256 totalPrice = (duration * spots[spotId].pricePerHour) / 3600;

        uint256 bookingId = ++bookingCounter;
        bookings[bookingId] = Booking({
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

        userBookings[msg.sender].push(bookingId);
        spotBookings[spotId].push(bookingId);

        emit BookingCreated(bookingId, spotId, msg.sender, startTime, endTime, totalPrice);
        return bookingId;
    }

    function cancelBooking(uint256 bookingId) external nonReentrant validBooking(bookingId) {
        Booking storage booking = bookings[bookingId];
        if (booking.user != msg.sender && spots[booking.spotId].owner != msg.sender) revert NotAuthorized();
        if (!booking.isActive || booking.isCancelled) revert BookingNotActive();
        if (block.timestamp >= booking.startTime) revert CannotCancelActiveBooking();

        booking.isCancelled = true;
        booking.isActive = false;
        spots[booking.spotId].isAvailable = true;

        emit BookingCancelled(bookingId, booking.spotId, msg.sender);
    }

    function completeBooking(uint256 bookingId) external validBooking(bookingId) {
        Booking storage booking = bookings[bookingId];
        if (booking.user != msg.sender && spots[booking.spotId].owner != msg.sender) revert NotAuthorized();
        if (booking.isCancelled || booking.isCompleted) revert BookingNotActive();
        if (block.timestamp < booking.endTime) revert InvalidTimeRange();

        booking.isCompleted = true;
        booking.isActive = false;

        emit BookingCompleted(bookingId, booking.spotId, booking.user);
    }

    function updateSpotAvailability(uint256 spotId, bool isAvailable) external onlySpotOwner(spotId) nonReentrant {
        if (isAvailable) {
            uint256[] memory bookingIds = spotBookings[spotId];
            for (uint256 i = 0; i < bookingIds.length; i++) {
                Booking memory booking = bookings[bookingIds[i]];
                if (booking.isActive && !booking.isCancelled && !booking.isCompleted) {
                    if (block.timestamp >= booking.startTime && block.timestamp < booking.endTime) {
                        revert SpotNotAvailable();
                    }
                }
            }
        }

        spots[spotId].isAvailable = isAvailable;
        emit SpotAvailabilityUpdated(spotId, isAvailable);
    }

    function transferSpotOwnership(uint256 spotId, address newOwner) external onlySpotOwner(spotId) nonReentrant {
        if (newOwner == address(0) || newOwner == spots[spotId].owner) revert InvalidOwner();

        address previousOwner = spots[spotId].owner;
        spots[spotId].owner = newOwner;

        uint256[] storage oldOwnerSpots = ownerSpots[previousOwner];
        for (uint256 i = 0; i < oldOwnerSpots.length; i++) {
            if (oldOwnerSpots[i] == spotId) {
                oldOwnerSpots[i] = oldOwnerSpots[oldOwnerSpots.length - 1];
                oldOwnerSpots.pop();
                break;
            }
        }
        ownerSpots[newOwner].push(spotId);

        emit OwnershipTransferred(spotId, previousOwner, newOwner);
    }

    function recordCheckIn(uint256 bookingId) external nonReentrant validBooking(bookingId) {
        Booking storage booking = bookings[bookingId];
        if (msg.sender != booking.user && msg.sender != spots[booking.spotId].owner) revert NotAuthorized();
        if (booking.checkInTime != 0) revert CheckInRecorded();
        if (booking.isCancelled) revert BookingNotActive();

        booking.checkInTime = block.timestamp;
        emit CheckInRecorded(bookingId, block.timestamp);
    }

    function recordCheckOut(uint256 bookingId) external nonReentrant validBooking(bookingId) {
        Booking storage booking = bookings[bookingId];
        if (msg.sender != booking.user && msg.sender != spots[booking.spotId].owner) revert NotAuthorized();
        if (booking.checkInTime == 0) revert BookingNotActive();
        if (booking.checkOutTime != 0) revert CheckOutRecorded();

        booking.checkOutTime = block.timestamp;
        emit CheckOutRecorded(bookingId, block.timestamp);
    }

    function getSpot(uint256 spotId) external view returns (Spot memory) {
        return spots[spotId];
    }

    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }

    function getSpotBookings(uint256 spotId) external view returns (uint256[] memory) {
        return spotBookings[spotId];
    }

    function getOwnerSpots(address owner) external view returns (uint256[] memory) {
        return ownerSpots[owner];
    }


}