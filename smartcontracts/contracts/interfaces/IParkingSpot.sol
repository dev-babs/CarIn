// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IParkingSpot
 * @notice Interface for ParkingSpot contract integration
 */
interface IParkingSpot {
    struct Spot {
        uint256 id;
        address owner;
        string location;
        uint256 pricePerHour;
        bool isAvailable;
        uint256 createdAt;
    }

    struct Booking {
        uint256 bookingId;
        uint256 spotId;
        address user;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrice;
        bool isActive;
        bool isCancelled;
        bool isCompleted;
    }

    function getSpot(uint256 spotId) external view returns (Spot memory);
    function getBooking(uint256 bookingId) external view returns (Booking memory);
    function spotCounter() external view returns (uint256);
    function spotMultiCounter() external view returns (uint256[]);
}

