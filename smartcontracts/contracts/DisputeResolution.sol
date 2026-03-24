// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PaymentEscrow.sol";
import "./interfaces/IParkingSpot.sol";

/**
 * @title DisputeResolution
 * @dev Automated dispute resolution system with evidence-based refund logic and voting mechanism
 * @notice Handles dispute filing, evidence submission, automated decisions based on timestamps,
 *         and voting for complex disputes requiring human judgment
 */
contract DisputeResolution is Ownable, ReentrancyGuard, Pausable {
    PaymentEscrow public paymentEscrow;
    IParkingSpot public parkingSpot;

    // Dispute resolution types
    enum ResolutionType {
        Automated,      // Resolved automatically based on evidence
        PendingVote,    // Requires voting
        Manual          // Requires admin resolution
    }

    // Evidence types
    enum EvidenceType {
        CheckInTimestamp,
        CheckOutTimestamp,
        Image,
        Video,
        Document,
        LocationData,
        Other
    }

    // Dispute details structure
    struct DisputeDetails {
        uint256 disputeId;
        uint256 escrowId;
        uint256 bookingId;
        address filedBy;
        address opposingParty;
        string reason;
        bytes primaryEvidenceHash;  // IPFS hash
        uint256 filedAt;
        ResolutionType resolutionType;
        bool isResolved;
        address resolvedBy;
        uint256 resolvedAt;
        bool refundApproved;
        uint256 refundPercentage;  // 0-100, for partial refunds
    }

    // Evidence structure
    struct Evidence {
        uint256 evidenceId;
        uint256 disputeId;
        address submittedBy;
        EvidenceType evidenceType;
        bytes evidenceHash;  // IPFS hash
        uint256 timestamp;
        string description;
    }

    // Check-in/check-out timestamp structure
    struct CheckInData {
        uint256 bookingId;
        uint256 checkInTime;
        uint256 checkOutTime;
        bool checkedIn;
        bool checkedOut;
        address verifiedBy;  // Spot owner or automated system
    }

    // Voting structure for complex disputes
    struct Vote {
        address voter;
        bool supportsRefund;
        uint256 weight;
        uint256 timestamp;
        string justification;
    }

    // State mappings
    mapping(uint256 => DisputeDetails) public disputes;
    mapping(uint256 => Evidence[]) public disputeEvidence;
    mapping(uint256 => CheckInData) public checkInRecords;
    mapping(uint256 => Vote[]) public disputeVotes;
    mapping(address => bool) public moderators;
    mapping(address => bool) public authorizedVoters;  // For voting mechanism
    mapping(uint256 => uint256) public escrowToDispute;

    uint256 public disputeCounter;
    uint256 public evidenceCounter;
    
    // Configuration
    uint256 public maxResolutionTime = 7 days;
    uint256 public autoRefundThreshold = 80;  // 80% of votes needed for auto-resolution
    uint256 public minVotesForResolution = 3;
    uint256 public lateCheckInThreshold = 30 minutes;  // 30 minutes late = auto refund
    uint256 public noShowThreshold = 1 hours;  // 1 hour no-show = auto refund

    // Events
    event DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed escrowId,
        uint256 indexed bookingId,
        address filedBy,
        address opposingParty,
        string reason,
        ResolutionType resolutionType
    );

    event EvidenceSubmitted(
        uint256 indexed evidenceId,
        uint256 indexed disputeId,
        address submittedBy,
        EvidenceType evidenceType,
        bytes evidenceHash
    );

    event CheckInRecorded(
        uint256 indexed bookingId,
        uint256 checkInTime,
        address verifiedBy
    );

    event CheckOutRecorded(
        uint256 indexed bookingId,
        uint256 checkOutTime,
        address verifiedBy
    );

    event AutomatedResolution(
        uint256 indexed disputeId,
        bool refundApproved,
        uint256 refundPercentage,
        string reason
    );

    event VoteSubmitted(
        uint256 indexed disputeId,
        address indexed voter,
        bool supportsRefund,
        uint256 weight
    );

    event DisputeResolved(
        uint256 indexed disputeId,
        address resolvedBy,
        bool refundApproved,
        uint256 refundPercentage,
        ResolutionType resolutionType
    );

    event ModeratorAdded(address indexed moderator);
    event ModeratorRemoved(address indexed moderator);
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);

    modifier onlyModerator() {
        require(moderators[msg.sender] || msg.sender == owner(), "Not authorized moderator");
        _;
    }

    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender] || msg.sender == owner(), "Not authorized voter");
        _;
    }

    constructor(address _paymentEscrow, address _parkingSpot) Ownable(msg.sender) {
        require(_paymentEscrow != address(0), "Invalid PaymentEscrow address");
        require(_parkingSpot != address(0), "Invalid ParkingSpot address");
        paymentEscrow = PaymentEscrow(_paymentEscrow);
        parkingSpot = IParkingSpot(_parkingSpot);
    }

    /**
     * @dev Set PaymentEscrow contract address
     */
    function setPaymentEscrow(address _paymentEscrow) external onlyOwner {
        require(_paymentEscrow != address(0), "Invalid address");
        paymentEscrow = PaymentEscrow(_paymentEscrow);
    }

    /**
     * @dev Set ParkingSpot contract address
     */
    function setParkingSpot(address _parkingSpot) external onlyOwner {
        require(_parkingSpot != address(0), "Invalid address");
        parkingSpot = IParkingSpot(_parkingSpot);
    }

    /**
     * @dev Add a moderator
     */
    function addModerator(address _moderator) external onlyOwner {
        require(_moderator != address(0), "Invalid address");
        moderators[_moderator] = true;
        emit ModeratorAdded(_moderator);
    }

    /**
     * @dev Remove a moderator
     */
    function removeModerator(address _moderator) external onlyOwner {
        moderators[_moderator] = false;
        emit ModeratorRemoved(_moderator);
    }

    /**
     * @dev Authorize a voter for the voting mechanism
     */
    function authorizeVoter(address _voter) external onlyOwner {
        require(_voter != address(0), "Invalid address");
        authorizedVoters[_voter] = true;
        emit VoterAuthorized(_voter);
    }

    /**
     * @dev Revoke voter authorization
     */
    function revokeVoter(address _voter) external onlyOwner {
        authorizedVoters[_voter] = false;
        emit VoterRevoked(_voter);
    }

    /**
     * @dev Record check-in for a booking
     */
    function recordCheckIn(uint256 bookingId, uint256 checkInTime) external nonReentrant {
        IParkingSpot.Spot memory spot = parkingSpot.getSpot(parkingSpot.getBooking(bookingId).spotId);
        require(
            msg.sender == spot.owner || moderators[msg.sender],
            "Not authorized to record check-in"
        );
        require(checkInRecords[bookingId].checkInTime == 0, "Check-in already recorded");

        checkInRecords[bookingId] = CheckInData({
            bookingId: bookingId,
            checkInTime: checkInTime,
            checkOutTime: 0,
            checkedIn: true,
            checkedOut: false,
            verifiedBy: msg.sender
        });

        emit CheckInRecorded(bookingId, checkInTime, msg.sender);
    }

    /**
     * @dev Record check-out for a booking
     */
    function recordCheckOut(uint256 bookingId, uint256 checkOutTime) external nonReentrant {
        IParkingSpot.Spot memory spot = parkingSpot.getSpot(parkingSpot.getBooking(bookingId).spotId);
        require(
            msg.sender == spot.owner || moderators[msg.sender],
            "Not authorized to record check-out"
        );
        require(checkInRecords[bookingId].checkedIn, "Check-in not recorded");
        require(!checkInRecords[bookingId].checkedOut, "Check-out already recorded");

        checkInRecords[bookingId].checkOutTime = checkOutTime;
        checkInRecords[bookingId].checkedOut = true;

        emit CheckOutRecorded(bookingId, checkOutTime, msg.sender);
    }

    /**
     * @dev File a dispute with initial evidence
     */
    function fileDispute(
        uint256 escrowId,
        uint256 bookingId,
        string memory reason,
        bytes memory evidenceHash,
        EvidenceType evidenceType
    ) external nonReentrant whenNotPaused returns (uint256) {
        PaymentEscrow.Escrow memory escrow = paymentEscrow.getEscrow(escrowId);
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(
            msg.sender == escrow.payer || msg.sender == escrow.payee,
            "Only parties can file dispute"
        );
        require(escrow.disputeStatus == PaymentEscrow.DisputeStatus.None, "Dispute already exists");
        require(escrow.status == PaymentEscrow.EscrowStatus.Pending, "Escrow not in pending status");

        // File dispute in PaymentEscrow first
        paymentEscrow.fileDispute(escrowId, reason, evidenceHash);
        // Get the dispute ID from escrow mapping
        uint256 escrowDisputeId = paymentEscrow.escrowToDispute(escrowId);

        disputeCounter++;
        address opposingParty = msg.sender == escrow.payer ? escrow.payee : escrow.payer;

        disputes[disputeCounter] = DisputeDetails({
            disputeId: disputeCounter,
            escrowId: escrowId,
            bookingId: bookingId,
            filedBy: msg.sender,
            opposingParty: opposingParty,
            reason: reason,
            primaryEvidenceHash: evidenceHash,
            filedAt: block.timestamp,
            resolutionType: ResolutionType.Automated,
            isResolved: false,
            resolvedBy: address(0),
            resolvedAt: 0,
            refundApproved: false,
            refundPercentage: 0
        });

        escrowToDispute[escrowId] = disputeCounter;

        // Add initial evidence
        evidenceCounter++;
        disputeEvidence[disputeCounter].push(Evidence({
            evidenceId: evidenceCounter,
            disputeId: disputeCounter,
            submittedBy: msg.sender,
            evidenceType: evidenceType,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            description: reason
        }));

        emit DisputeFiled(
            disputeCounter,
            escrowId,
            bookingId,
            msg.sender,
            opposingParty,
            reason,
            ResolutionType.Automated
        );

        // Try automated resolution
        _attemptAutomatedResolution(disputeCounter);

        return disputeCounter;
    }

    /**
     * @dev Submit additional evidence to an existing dispute
     */
    function submitEvidence(
        uint256 disputeId,
        EvidenceType evidenceType,
        bytes memory evidenceHash,
        string memory description
    ) external nonReentrant whenNotPaused {
        DisputeDetails storage dispute = disputes[disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(
            msg.sender == dispute.filedBy || msg.sender == dispute.opposingParty,
            "Not authorized to submit evidence"
        );
        require(!dispute.isResolved, "Dispute already resolved");

        evidenceCounter++;
        disputeEvidence[disputeId].push(Evidence({
            evidenceId: evidenceCounter,
            disputeId: disputeId,
            submittedBy: msg.sender,
            evidenceType: evidenceType,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            description: description
        }));

        emit EvidenceSubmitted(evidenceCounter, disputeId, msg.sender, evidenceType, evidenceHash);

        // Re-attempt automated resolution with new evidence
        if (dispute.resolutionType == ResolutionType.Automated && !dispute.isResolved) {
            _attemptAutomatedResolution(disputeId);
        }
    }

    /**
     * @dev Attempt automated resolution based on evidence and timestamps
     */
    function _attemptAutomatedResolution(uint256 disputeId) internal {
        DisputeDetails storage dispute = disputes[disputeId];
        if (dispute.isResolved) return;

        PaymentEscrow.Escrow memory escrow = paymentEscrow.getEscrow(dispute.escrowId);
        IParkingSpot.Booking memory booking = parkingSpot.getBooking(dispute.bookingId);
        CheckInData memory checkIn = checkInRecords[dispute.bookingId];

        // Check for no-show scenario
        if (!checkIn.checkedIn && block.timestamp > booking.startTime + noShowThreshold) {
            _resolveDispute(disputeId, true, 100, ResolutionType.Automated, "No-show detected");
            return;
        }

        // Check for late check-in
        if (checkIn.checkedIn && checkIn.checkInTime > booking.startTime + lateCheckInThreshold) {
            uint256 lateMinutes = (checkIn.checkInTime - booking.startTime) / 60;
            uint256 refundPercent = (lateMinutes * 100) / 60; // 1% per minute late, capped at 50%
            if (refundPercent > 50) refundPercent = 50;
            _resolveDispute(disputeId, true, refundPercent, ResolutionType.Automated, "Late check-in");
            return;
        }

        // Check for early check-out (partial refund)
        if (checkIn.checkedOut && checkIn.checkOutTime < booking.endTime - 1 hours) {
            uint256 unusedMinutes = (booking.endTime - checkIn.checkOutTime) / 60;
            uint256 totalMinutes = (booking.endTime - booking.startTime) / 60;
            uint256 refundPercent = (unusedMinutes * 100) / totalMinutes;
            if (refundPercent > 30) refundPercent = 30; // Max 30% refund for early check-out
            _resolveDispute(disputeId, true, refundPercent, ResolutionType.Automated, "Early check-out");
            return;
        }

        // If no automated resolution can be determined, escalate to voting or manual
        if (block.timestamp > dispute.filedAt + maxResolutionTime / 2) {
            dispute.resolutionType = ResolutionType.PendingVote;
        }
    }

    /**
     * @dev Submit a vote on a dispute (for voting mechanism)
     */
    function submitVote(
        uint256 disputeId,
        bool supportsRefund,
        uint256 refundPercentage,
        string memory justification
    ) external nonReentrant onlyAuthorizedVoter whenNotPaused {
        DisputeDetails storage dispute = disputes[disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(dispute.resolutionType == ResolutionType.PendingVote, "Dispute not in voting phase");
        require(!dispute.isResolved, "Dispute already resolved");

        // Check if voter already voted
        for (uint256 i = 0; i < disputeVotes[disputeId].length; i++) {
            require(
                disputeVotes[disputeId][i].voter != msg.sender,
                "Already voted"
            );
        }

        disputeVotes[disputeId].push(Vote({
            voter: msg.sender,
            supportsRefund: supportsRefund,
            weight: 1, // Equal weight for now, can be extended with token-based voting
            timestamp: block.timestamp,
            justification: justification
        }));

        emit VoteSubmitted(disputeId, msg.sender, supportsRefund, 1);

        // Check if we have enough votes to resolve
        _checkVotingResolution(disputeId);
    }

    /**
     * @dev Check if voting results are sufficient to resolve dispute
     */
    function _checkVotingResolution(uint256 disputeId) internal {
        DisputeDetails storage dispute = disputes[disputeId];
        Vote[] memory votes = disputeVotes[disputeId];

        if (votes.length < minVotesForResolution) return;

        uint256 totalWeight = 0;
        uint256 refundWeight = 0;

        for (uint256 i = 0; i < votes.length; i++) {
            totalWeight += votes[i].weight;
            if (votes[i].supportsRefund) {
                refundWeight += votes[i].weight;
            }
        }

        uint256 refundPercentage = (refundWeight * 100) / totalWeight;
        
        if (refundPercentage >= autoRefundThreshold) {
            // Calculate average refund percentage from votes
            uint256 totalRefundPercent = 0;
            uint256 refundVoteCount = 0;
            for (uint256 i = 0; i < votes.length; i++) {
                if (votes[i].supportsRefund) {
                    totalRefundPercent += 100; // Assuming full refund votes, can be extended
                    refundVoteCount++;
                }
            }
            uint256 avgRefundPercent = refundVoteCount > 0 ? totalRefundPercent / refundVoteCount : 0;
            _resolveDispute(disputeId, true, avgRefundPercent, ResolutionType.PendingVote, "Voting resolution");
        } else if (refundPercentage < (100 - autoRefundThreshold)) {
            _resolveDispute(disputeId, false, 0, ResolutionType.PendingVote, "Voting resolution");
        }
    }

    /**
     * @dev Resolve dispute manually (moderator/admin only)
     */
    function resolveDisputeManually(
        uint256 disputeId,
        bool refundApproved,
        uint256 refundPercentage
    ) external onlyModerator nonReentrant whenNotPaused {
        DisputeDetails storage dispute = disputes[disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(!dispute.isResolved, "Dispute already resolved");
        require(refundPercentage <= 100, "Invalid refund percentage");

        _resolveDispute(disputeId, refundApproved, refundPercentage, ResolutionType.Manual, "Manual resolution");
    }

    /**
     * @dev Internal function to resolve a dispute
     */
    function _resolveDispute(
        uint256 disputeId,
        bool refundApproved,
        uint256 refundPercentage,
        ResolutionType resolutionType,
        string memory reason
    ) internal {
        DisputeDetails storage dispute = disputes[disputeId];
        PaymentEscrow.Escrow memory escrow = paymentEscrow.getEscrow(dispute.escrowId);

        dispute.isResolved = true;
        dispute.resolvedBy = msg.sender;
        dispute.resolvedAt = block.timestamp;
        dispute.refundApproved = refundApproved;
        dispute.refundPercentage = refundPercentage;
        dispute.resolutionType = resolutionType;

        // Get the PaymentEscrow dispute ID
        uint256 escrowDisputeId = paymentEscrow.escrowToDispute(dispute.escrowId);
        
        if (refundApproved) {
            if (refundPercentage == 100) {
                // Full refund via PaymentEscrow
                paymentEscrow.resolveDispute(
                    escrowDisputeId,
                    true,
                    0,
                    0
                );
            } else if (refundPercentage > 0) {
                // Partial refund
                uint256 refundAmount = (escrow.amount * refundPercentage) / 100;
                uint256 releaseAmount = escrow.amount - refundAmount;
                paymentEscrow.resolveDispute(
                    escrowDisputeId,
                    true,
                    refundAmount,
                    releaseAmount
                );
            }
        } else {
            // No refund - release to payee
            paymentEscrow.resolveDispute(
                escrowDisputeId,
                false,
                0,
                0
            );
        }

        emit DisputeResolved(disputeId, msg.sender, refundApproved, refundPercentage, resolutionType);
        
        if (resolutionType == ResolutionType.Automated) {
            emit AutomatedResolution(disputeId, refundApproved, refundPercentage, reason);
        }
    }

    /**
     * @dev Get dispute details
     */
    function getDispute(uint256 disputeId) external view returns (DisputeDetails memory) {
        return disputes[disputeId];
    }

    /**
     * @dev Get all evidence for a dispute
     */
    function getDisputeEvidence(uint256 disputeId) external view returns (Evidence[] memory) {
        return disputeEvidence[disputeId];
    }

    /**
     * @dev Get check-in data for a booking
     */
    function getCheckInData(uint256 bookingId) external view returns (CheckInData memory) {
        return checkInRecords[bookingId];
    }

    /**
     * @dev Get votes for a dispute
     */
    function getDisputeVotes(uint256 disputeId) external view returns (Vote[] memory) {
        return disputeVotes[disputeId];
    }

    /**
     * @dev Get dispute ID by escrow ID
     */
    function getDisputeByEscrowId(uint256 escrowId) external view returns (DisputeDetails memory) {
        return disputes[escrowToDispute[escrowId]];
    }

    /**
     * @dev Update configuration parameters
     */
    function updateConfiguration(
        uint256 _maxResolutionTime,
        uint256 _autoRefundThreshold,
        uint256 _minVotesForResolution,
        uint256 _lateCheckInThreshold,
        uint256 _noShowThreshold
    ) external onlyOwner {
        maxResolutionTime = _maxResolutionTime;
        autoRefundThreshold = _autoRefundThreshold;
        minVotesForResolution = _minVotesForResolution;
        lateCheckInThreshold = _lateCheckInThreshold;
        noShowThreshold = _noShowThreshold;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
