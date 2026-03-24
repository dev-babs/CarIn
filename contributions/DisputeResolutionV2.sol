// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./PaymentEscrow.sol";
import "./interfaces/IParkingSpot.sol";

/**
 * @title DisputeResolution
 * @dev Secure, efficient dispute resolution with automated and voting-based resolution
 */
contract DisputeResolutionV2 is Ownable, ReentrancyGuard, Pausable {
    enum ResolutionType {
        Automated,
        PendingVote,
        Manual
    }
    enum EvidenceType {
        CheckIn,
        CheckOut,
        Image,
        Video,
        Document,
        Location,
        Other
    }

    struct DisputeDetails {
        uint256 escrowId;
        uint256 bookingId;
        address filedBy;
        address opposingParty;
        string reason;
        bytes32 evidenceHash;
        uint256 filedAt;
        ResolutionType resolutionType;
        bool isResolved;
        address resolvedBy;
        uint256 refundPercentage;
    }

    struct Evidence {
        address submittedBy;
        EvidenceType evidenceType;
        bytes32 evidenceHash;
        uint256 timestamp;
    }

    struct CheckInData {
        uint256 checkInTime;
        uint256 checkOutTime;
        bool checkedIn;
        bool checkedOut;
        address verifiedBy;
    }

    struct Vote {
        bool supportsRefund;
        uint256 weight;
        uint256 timestamp;
    }

    PaymentEscrow public paymentEscrow;
    IParkingSpot public parkingSpot;

    mapping(uint256 => DisputeDetails) public disputes;
    mapping(uint256 => Evidence[]) public disputeEvidence;
    mapping(uint256 => CheckInData) public checkInRecords;
    mapping(uint256 => mapping(address => Vote)) public disputeVotes;
    mapping(address => bool) public moderators;
    mapping(address => bool) public authorizedVoters;

    uint256 public disputeCounter;
    uint256 public maxResolutionTime = 7 days;
    uint256 public autoRefundThreshold = 80;
    uint256 public minVotesForResolution = 3;
    uint256 public lateCheckInThreshold = 30 minutes;
    uint256 public noShowThreshold = 1 hours;

    event DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed escrowId,
        address filedBy
    );
    event EvidenceSubmitted(
        uint256 indexed disputeId,
        address submittedBy,
        EvidenceType evidenceType
    );
    event CheckInRecorded(uint256 indexed bookingId, uint256 checkInTime);
    event CheckOutRecorded(uint256 indexed bookingId, uint256 checkOutTime);
    event DisputeResolved(
        uint256 indexed disputeId,
        bool refundApproved,
        uint256 refundPercentage
    );
    event VoteSubmitted(
        uint256 indexed disputeId,
        address indexed voter,
        bool supportsRefund
    );
    event ModeratorUpdated(address indexed moderator, bool active);
    event VoterUpdated(address indexed voter, bool active);

    modifier onlyModerator() {
        require(
            moderators[msg.sender] || msg.sender == owner(),
            "Not moderator"
        );
        _;
    }

    modifier onlyAuthorizedVoter() {
        require(
            authorizedVoters[msg.sender] || msg.sender == owner(),
            "Not authorized voter"
        );
        _;
    }

    modifier validDispute(uint256 disputeId) {
        require(disputes[disputeId].filedAt != 0, "Dispute not found");
        require(!disputes[disputeId].isResolved, "Already resolved");
        _;
    }

    constructor(
        address _paymentEscrow,
        address _parkingSpot
    ) Ownable(msg.sender) {
        require(
            _paymentEscrow != address(0) && _parkingSpot != address(0),
            "Invalid addresses"
        );
        paymentEscrow = PaymentEscrow(_paymentEscrow);
        parkingSpot = IParkingSpot(_parkingSpot);
    }

    function setPaymentEscrow(address _paymentEscrow) external onlyOwner {
        require(_paymentEscrow != address(0), "Invalid address");
        paymentEscrow = PaymentEscrow(_paymentEscrow);
    }

    function setParkingSpot(address _parkingSpot) external onlyOwner {
        require(_parkingSpot != address(0), "Invalid address");
        parkingSpot = IParkingSpot(_parkingSpot);
    }

    function setModerator(address _moderator, bool active) external onlyOwner {
        require(_moderator != address(0), "Invalid address");
        moderators[_moderator] = active;
        emit ModeratorUpdated(_moderator, active);
    }

    function setVoter(address _voter, bool active) external onlyOwner {
        require(_voter != address(0), "Invalid address");
        authorizedVoters[_voter] = active;
        emit VoterUpdated(_voter, active);
    }

    function recordCheckIn(
        uint256 bookingId,
        uint256 checkInTime
    ) external nonReentrant {
        IParkingSpot.Booking memory booking = parkingSpot.getBooking(bookingId);
        IParkingSpot.Spot memory spot = parkingSpot.getSpot(booking.spotId);

        require(
            msg.sender == spot.owner || moderators[msg.sender],
            "Unauthorized"
        );
        require(checkInRecords[bookingId].checkInTime == 0, "Already recorded");

        checkInRecords[bookingId] = CheckInData({
            checkInTime: checkInTime,
            checkOutTime: 0,
            checkedIn: true,
            checkedOut: false,
            verifiedBy: msg.sender
        });

        emit CheckInRecorded(bookingId, checkInTime);
    }

    function recordCheckOut(
        uint256 bookingId,
        uint256 checkOutTime
    ) external nonReentrant {
        CheckInData storage checkIn = checkInRecords[bookingId];
        require(checkIn.checkedIn, "Not checked in");
        require(!checkIn.checkedOut, "Already checked out");

        IParkingSpot.Booking memory booking = parkingSpot.getBooking(bookingId);
        IParkingSpot.Spot memory spot = parkingSpot.getSpot(booking.spotId);
        require(
            msg.sender == spot.owner || moderators[msg.sender],
            "Unauthorized"
        );

        checkIn.checkOutTime = checkOutTime;
        checkIn.checkedOut = true;

        emit CheckOutRecorded(bookingId, checkOutTime);
    }

    function fileDispute(
        uint256 escrowId,
        uint256 bookingId,
        string calldata reason,
        bytes32 evidenceHash,
        EvidenceType evidenceType
    ) external nonReentrant whenNotPaused returns (uint256) {
        PaymentEscrow.Escrow memory escrow = paymentEscrow.getEscrow(escrowId);
        require(escrow.escrowId != 0, "Escrow not found");
        require(
            msg.sender == escrow.payer || msg.sender == escrow.payee,
            "Not party to escrow"
        );
        require(
            escrow.disputeStatus == PaymentEscrow.DisputeStatus.None,
            "Dispute exists"
        );
        require(
            escrow.status == PaymentEscrow.EscrowStatus.Pending,
            "Invalid status"
        );

        paymentEscrow.fileDispute(escrowId, reason, evidenceHash);

        uint256 disputeId = ++disputeCounter;
        address opposingParty = msg.sender == escrow.payer
            ? escrow.payee
            : escrow.payer;

        disputes[disputeId] = DisputeDetails({
            escrowId: escrowId,
            bookingId: bookingId,
            filedBy: msg.sender,
            opposingParty: opposingParty,
            reason: reason,
            evidenceHash: evidenceHash,
            filedAt: block.timestamp,
            resolutionType: ResolutionType.Automated,
            isResolved: false,
            resolvedBy: address(0),
            refundPercentage: 0
        });

        disputeEvidence[disputeId].push(
            Evidence({
                submittedBy: msg.sender,
                evidenceType: evidenceType,
                evidenceHash: evidenceHash,
                timestamp: block.timestamp
            })
        );

        emit DisputeFiled(disputeId, escrowId, msg.sender);
        _attemptAutomatedResolution(disputeId);

        return disputeId;
    }

    function submitEvidence(
        uint256 disputeId,
        EvidenceType evidenceType,
        bytes32 evidenceHash
    ) external nonReentrant whenNotPaused validDispute(disputeId) {
        DisputeDetails storage dispute = disputes[disputeId];
        require(
            msg.sender == dispute.filedBy ||
                msg.sender == dispute.opposingParty,
            "Unauthorized"
        );

        disputeEvidence[disputeId].push(
            Evidence({
                submittedBy: msg.sender,
                evidenceType: evidenceType,
                evidenceHash: evidenceHash,
                timestamp: block.timestamp
            })
        );

        emit EvidenceSubmitted(disputeId, msg.sender, evidenceType);

        if (dispute.resolutionType == ResolutionType.Automated) {
            _attemptAutomatedResolution(disputeId);
        }
    }

    function _attemptAutomatedResolution(uint256 disputeId) internal {
        DisputeDetails storage dispute = disputes[disputeId];
        if (dispute.isResolved) return;

        IParkingSpot.Booking memory booking = parkingSpot.getBooking(
            dispute.bookingId
        );
        CheckInData memory checkIn = checkInRecords[dispute.bookingId];

        if (
            !checkIn.checkedIn &&
            block.timestamp > booking.startTime + noShowThreshold
        ) {
            _resolveDispute(disputeId, true, 100);
            return;
        }

        if (
            checkIn.checkedIn &&
            checkIn.checkInTime > booking.startTime + lateCheckInThreshold
        ) {
            uint256 lateMinutes = (checkIn.checkInTime - booking.startTime) /
                60;
            uint256 refund = min((lateMinutes * 100) / 60, 50);
            _resolveDispute(disputeId, true, refund);
            return;
        }

        if (
            checkIn.checkedOut &&
            checkIn.checkOutTime < booking.endTime - 1 hours
        ) {
            uint256 unusedMinutes = (booking.endTime - checkIn.checkOutTime) /
                60;
            uint256 totalMinutes = (booking.endTime - booking.startTime) / 60;
            uint256 refund = min((unusedMinutes * 100) / totalMinutes, 30);
            _resolveDispute(disputeId, true, refund);
            return;
        }

        if (block.timestamp > dispute.filedAt + maxResolutionTime / 2) {
            dispute.resolutionType = ResolutionType.PendingVote;
        }
    }

    function submitVote(
        uint256 disputeId,
        bool supportsRefund
    )
        external
        nonReentrant
        onlyAuthorizedVoter
        whenNotPaused
        validDispute(disputeId)
    {
        DisputeDetails storage dispute = disputes[disputeId];
        require(
            dispute.resolutionType == ResolutionType.PendingVote,
            "Not in voting phase"
        );
        require(
            disputeVotes[disputeId][msg.sender].timestamp == 0,
            "Already voted"
        );

        disputeVotes[disputeId][msg.sender] = Vote({
            supportsRefund: supportsRefund,
            weight: 1,
            timestamp: block.timestamp
        });

        emit VoteSubmitted(disputeId, msg.sender, supportsRefund);
        _checkVotingResolution(disputeId);
    }

    function _checkVotingResolution(uint256 disputeId) internal {
        DisputeDetails storage dispute = disputes[disputeId];
        Evidence[] memory evidence = disputeEvidence[disputeId];

        uint256 refundVotes = 0;
        uint256 totalVotes = 0;

        for (uint256 i = 0; i < evidence.length; i++) {
            Vote memory vote = disputeVotes[disputeId][evidence[i].submittedBy];
            if (vote.timestamp != 0) {
                totalVotes++;
                if (vote.supportsRefund) refundVotes++;
            }
        }

        if (totalVotes < minVotesForResolution) return;

        uint256 refundPercentage = (refundVotes * 100) / totalVotes;
        if (refundPercentage >= autoRefundThreshold) {
            _resolveDispute(disputeId, true, 100);
        } else if (refundPercentage < (100 - autoRefundThreshold)) {
            _resolveDispute(disputeId, false, 0);
        }
    }

    function resolveDisputeManually(
        uint256 disputeId,
        bool refundApproved,
        uint256 refundPercentage
    )
        external
        onlyModerator
        nonReentrant
        whenNotPaused
        validDispute(disputeId)
    {
        require(refundPercentage <= 100, "Invalid percentage");
        _resolveDispute(disputeId, refundApproved, refundPercentage);
    }

    function _resolveDispute(
        uint256 disputeId,
        bool refundApproved,
        uint256 refundPercentage
    ) internal {
        DisputeDetails storage dispute = disputes[disputeId];
        PaymentEscrow.Escrow memory escrow = paymentEscrow.getEscrow(
            dispute.escrowId
        );

        dispute.isResolved = true;
        dispute.resolvedBy = msg.sender;
        dispute.refundPercentage = refundPercentage;

        uint256 escrowDisputeId = paymentEscrow.escrowToDispute(
            dispute.escrowId
        );

        if (refundApproved) {
            if (refundPercentage == 100) {
                paymentEscrow.resolveDispute(escrowDisputeId, true, 0, 0);
            } else if (refundPercentage > 0) {
                uint256 refundAmount = (escrow.amount * refundPercentage) / 100;
                paymentEscrow.resolveDispute(
                    escrowDisputeId,
                    true,
                    refundAmount,
                    escrow.amount - refundAmount
                );
            }
        } else {
            paymentEscrow.resolveDispute(escrowDisputeId, false, 0, 0);
        }

        emit DisputeResolved(disputeId, refundApproved, refundPercentage);
    }

    function getDispute(
        uint256 disputeId
    ) external view returns (DisputeDetails memory) {
        return disputes[disputeId];
    }

    function getDisputeEvidence(
        uint256 disputeId
    ) external view returns (Evidence[] memory) {
        return disputeEvidence[disputeId];
    }

    function getCheckInData(
        uint256 bookingId
    ) external view returns (CheckInData memory) {
        return checkInRecords[bookingId];
    }

    function updateConfigs(
        uint256 _maxResTime,
        uint256 _autoThreshold,
        uint256 _minVotes,
        uint256 _lateThreshold,
        uint256 _noShowThreshold
    ) external onlyOwner {
        maxResolutionTime = _maxResTime;
        autoRefundThreshold = _autoThreshold;
        minVotesForResolution = _minVotes;
        lateCheckInThreshold = _lateThreshold;
        noShowThreshold = _noShowThreshold;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
