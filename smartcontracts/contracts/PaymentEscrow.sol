// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PaymentEscrow
 * @dev Enhanced payment escrow contract for parking bookings with dispute resolution,
 *      partial refunds, automatic releases, and multi-token support (CELO, cUSD, cEUR)
 */
contract PaymentEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Escrow status enum
    enum EscrowStatus {
        Pending,
        Released,
        Refunded,
        Disputed,
        PartiallyRefunded,
        Expired
    }

    // Dispute status enum
    enum DisputeStatus {
        None,
        Filed,
        Resolved,
        Rejected
    }

    // Escrow structure with enhanced fields
    struct Escrow {
        uint256 escrowId;
        uint256 bookingId;
        address payer;
        address payee;
        uint256 amount;
        uint256 releasedAmount;
        uint256 refundedAmount;
        address token; // address(0) for native CELO, otherwise ERC20 token address
        uint256 releaseTime;
        uint256 expirationTime;
        EscrowStatus status;
        DisputeStatus disputeStatus;
        bool isCancelled;
        uint256 createdAt;
    }

    // Dispute structure
    struct Dispute {
        uint256 disputeId;
        uint256 escrowId;
        address filedBy;
        string reason;
        bytes evidenceHash; // IPFS hash of evidence
        uint256 filedAt;
        address resolvedBy;
        uint256 resolvedAt;
        bool refundApproved;
    }

    // State variables
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public escrowToDispute; // escrowId => disputeId
    mapping(address => uint256[]) public payerEscrows;
    mapping(address => uint256[]) public payeeEscrows;
    
    uint256 public escrowCounter;
    uint256 public disputeCounter;
    
    // Configuration
    uint256 public defaultExpirationPeriod = 30 days;
    uint256 public minEscrowAmount = 0;
    address public cUSDToken; // Celo Dollar stablecoin
    address public cEURToken; // Celo Euro stablecoin

    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed bookingId,
        address indexed payer,
        address payee,
        uint256 amount,
        address token,
        uint256 releaseTime
    );
    
    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 timestamp
    );
    
    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    event PartialRefund(
        uint256 indexed escrowId,
        address indexed payer,
        uint256 refundAmount,
        uint256 remainingAmount,
        uint256 timestamp
    );
    
    event EscrowExpired(
        uint256 indexed escrowId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    event DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed escrowId,
        address indexed filedBy,
        string reason,
        bytes evidenceHash
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        uint256 indexed escrowId,
        address resolvedBy,
        bool refundApproved,
        uint256 timestamp
    );
    
    event AutomaticRelease(
        uint256 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _cUSDToken, address _cEURToken) Ownable(msg.sender) {
        cUSDToken = _cUSDToken;
        cEURToken = _cEURToken;
    }

    /**
     * @dev Create an escrow for a booking payment (native CELO)
     * @param bookingId The booking ID associated with this escrow
     * @param payee The address that will receive the payment
     * @param releaseTime When the escrow can be automatically released
     * @param expirationTime When the escrow expires and can be refunded (0 = use default)
     */
    function createEscrow(
        uint256 bookingId,
        address payee,
        uint256 releaseTime,
        uint256 expirationTime
    ) external payable nonReentrant returns (uint256) {
        require(payee != address(0), "Invalid payee address");
        require(msg.value > minEscrowAmount, "Amount below minimum");
        require(releaseTime > block.timestamp, "Release time must be in the future");
        
        uint256 expiration = expirationTime == 0 ? block.timestamp + defaultExpirationPeriod : expirationTime;
        require(expiration > releaseTime, "Expiration must be after release time");

        escrowCounter++;
        escrows[escrowCounter] = Escrow({
            escrowId: escrowCounter,
            bookingId: bookingId,
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            releasedAmount: 0,
            refundedAmount: 0,
            token: address(0),
            releaseTime: releaseTime,
            expirationTime: expiration,
            status: EscrowStatus.Pending,
            disputeStatus: DisputeStatus.None,
            isCancelled: false,
            createdAt: block.timestamp
        });

        payerEscrows[msg.sender].push(escrowCounter);
        payeeEscrows[payee].push(escrowCounter);

        emit EscrowCreated(
            escrowCounter,
            bookingId,
            msg.sender,
            payee,
            msg.value,
            address(0),
            releaseTime
        );
        
        return escrowCounter;
    }

    /**
     * @dev Create escrow with ERC20 token (cUSD, cEUR, etc.)
     * @param bookingId The booking ID
     * @param payee The payee address
     * @param token The ERC20 token address
     * @param amount The amount to escrow
     * @param releaseTime When escrow can be released
     * @param expirationTime When escrow expires (0 = use default)
     */
    function createEscrowERC20(
        uint256 bookingId,
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        uint256 expirationTime
    ) external nonReentrant returns (uint256) {
        require(payee != address(0), "Invalid payee address");
        require(token != address(0), "Invalid token address");
        require(amount > minEscrowAmount, "Amount below minimum");
        require(releaseTime > block.timestamp, "Release time must be in the future");
        require(
            token == cUSDToken || token == cEURToken || token != address(0),
            "Unsupported token"
        );

        uint256 expiration = expirationTime == 0 ? block.timestamp + defaultExpirationPeriod : expirationTime;
        require(expiration > releaseTime, "Expiration must be after release time");

        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        escrowCounter++;
        escrows[escrowCounter] = Escrow({
            escrowId: escrowCounter,
            bookingId: bookingId,
            payer: msg.sender,
            payee: payee,
            amount: amount,
            releasedAmount: 0,
            refundedAmount: 0,
            token: token,
            releaseTime: releaseTime,
            expirationTime: expiration,
            status: EscrowStatus.Pending,
            disputeStatus: DisputeStatus.None,
            isCancelled: false,
            createdAt: block.timestamp
        });

        payerEscrows[msg.sender].push(escrowCounter);
        payeeEscrows[payee].push(escrowCounter);

        emit EscrowCreated(
            escrowCounter,
            bookingId,
            msg.sender,
            payee,
            amount,
            token,
            releaseTime
        );
        
        return escrowCounter;
    }

    /**
     * @dev Release escrow payment to payee
     * @param escrowId The escrow ID to release
     */
    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");
        require(block.timestamp >= escrow.releaseTime, "Release time not reached");
        require(escrow.disputeStatus != DisputeStatus.Filed, "Escrow is disputed");
        require(
            msg.sender == escrow.payee || msg.sender == owner(),
            "Not authorized"
        );

        escrow.status = EscrowStatus.Released;
        escrow.releasedAmount = escrow.amount;

        _transfer(escrow.payee, escrow.token, escrow.amount);

        emit EscrowReleased(escrowId, escrow.payee, escrow.amount, block.timestamp);
    }

    /**
     * @dev Automatic release after release time has passed (1 hour grace period)
     * @param escrowId The escrow ID to automatically release
     */
    function automaticRelease(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");
        require(block.timestamp >= escrow.releaseTime + 1 hours, "Automatic release requires 1 hour grace period");
        require(escrow.disputeStatus != DisputeStatus.Filed, "Escrow is disputed");

        escrow.status = EscrowStatus.Released;
        escrow.releasedAmount = escrow.amount;

        _transfer(escrow.payee, escrow.token, escrow.amount);

        emit AutomaticRelease(escrowId, escrow.payee, escrow.amount, block.timestamp);
    }

    /**
     * @dev Refund escrow payment to payer (full refund)
     * @param escrowId The escrow ID to refund
     */
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");
        require(
            msg.sender == escrow.payer ||
            msg.sender == escrow.payee ||
            msg.sender == owner(),
            "Not authorized"
        );

        escrow.status = EscrowStatus.Refunded;
        escrow.refundedAmount = escrow.amount;

        _transfer(escrow.payer, escrow.token, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount, block.timestamp);
    }

    /**
     * @dev Partial refund of escrow payment
     * @param escrowId The escrow ID
     * @param refundAmount The amount to refund to payer
     * @param releaseAmount The amount to release to payee
     */
    function partialRefund(
        uint256 escrowId,
        uint256 refundAmount,
        uint256 releaseAmount
    ) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");
        require(msg.sender == owner() || escrow.disputeStatus == DisputeStatus.Resolved, "Not authorized");
        require(refundAmount + releaseAmount == escrow.amount, "Amounts must equal escrow amount");
        require(refundAmount > 0 && releaseAmount > 0, "Both amounts must be greater than 0");

        escrow.status = EscrowStatus.PartiallyRefunded;
        escrow.refundedAmount = refundAmount;
        escrow.releasedAmount = releaseAmount;

        _transfer(escrow.payer, escrow.token, refundAmount);
        _transfer(escrow.payee, escrow.token, releaseAmount);

        emit PartialRefund(
            escrowId,
            escrow.payer,
            refundAmount,
            releaseAmount,
            block.timestamp
        );
    }

    /**
     * @dev File a dispute for an escrow
     * @param escrowId The escrow ID
     * @param reason The reason for the dispute
     * @param evidenceHash IPFS hash of evidence
     */
    function fileDispute(
        uint256 escrowId,
        string memory reason,
        bytes memory evidenceHash
    ) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");
        require(
            msg.sender == escrow.payer || msg.sender == escrow.payee,
            "Only payer or payee can file dispute"
        );
        require(escrow.disputeStatus == DisputeStatus.None, "Dispute already filed");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        disputeCounter++;
        escrow.disputeStatus = DisputeStatus.Filed;
        escrow.status = EscrowStatus.Disputed;

        disputes[disputeCounter] = Dispute({
            disputeId: disputeCounter,
            escrowId: escrowId,
            filedBy: msg.sender,
            reason: reason,
            evidenceHash: evidenceHash,
            filedAt: block.timestamp,
            resolvedBy: address(0),
            resolvedAt: 0,
            refundApproved: false
        });

        escrowToDispute[escrowId] = disputeCounter;

        emit DisputeFiled(disputeCounter, escrowId, msg.sender, reason, evidenceHash);
    }

    /**
     * @dev Resolve a dispute (owner only)
     * @param disputeId The dispute ID
     * @param refundApproved Whether to approve refund
     * @param refundAmount Amount to refund (if partial, 0 = full refund)
     * @param releaseAmount Amount to release (if partial, 0 = full refund)
     */
    function resolveDispute(
        uint256 disputeId,
        bool refundApproved,
        uint256 refundAmount,
        uint256 releaseAmount
    ) external onlyOwner nonReentrant {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(dispute.disputeStatus == DisputeStatus.Filed, "Dispute not in filed status");

        Escrow storage escrow = escrows[dispute.escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow not in disputed status");

        dispute.disputeStatus = DisputeStatus.Resolved;
        dispute.resolvedBy = msg.sender;
        dispute.resolvedAt = block.timestamp;
        dispute.refundApproved = refundApproved;

        escrow.disputeStatus = DisputeStatus.Resolved;

        if (refundApproved) {
            if (refundAmount == 0 && releaseAmount == 0) {
                // Full refund
                escrow.status = EscrowStatus.Refunded;
                escrow.refundedAmount = escrow.amount;
                _transfer(escrow.payer, escrow.token, escrow.amount);
                emit EscrowRefunded(dispute.escrowId, escrow.payer, escrow.amount, block.timestamp);
            } else {
                // Partial refund
                require(refundAmount + releaseAmount == escrow.amount, "Amounts must equal escrow amount");
                escrow.status = EscrowStatus.PartiallyRefunded;
                escrow.refundedAmount = refundAmount;
                escrow.releasedAmount = releaseAmount;
                _transfer(escrow.payer, escrow.token, refundAmount);
                _transfer(escrow.payee, escrow.token, releaseAmount);
                emit PartialRefund(dispute.escrowId, escrow.payer, refundAmount, releaseAmount, block.timestamp);
            }
        } else {
            // Dispute rejected - release to payee
            escrow.status = EscrowStatus.Released;
            escrow.releasedAmount = escrow.amount;
            _transfer(escrow.payee, escrow.token, escrow.amount);
            emit EscrowReleased(dispute.escrowId, escrow.payee, escrow.amount, block.timestamp);
        }

        emit DisputeResolved(disputeId, dispute.escrowId, msg.sender, refundApproved, block.timestamp);
    }

    /**
     * @dev Handle expired escrows - allow refund after expiration
     * @param escrowId The escrow ID
     */
    function handleExpiredEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.Pending, "Escrow not in pending status");
        require(block.timestamp >= escrow.expirationTime, "Escrow not expired");
        require(escrow.disputeStatus != DisputeStatus.Filed, "Escrow is disputed");

        escrow.status = EscrowStatus.Expired;

        _transfer(escrow.payer, escrow.token, escrow.amount);

        emit EscrowExpired(escrowId, escrow.payer, escrow.amount, block.timestamp);
    }

    /**
     * @dev Internal transfer helper for native CELO and ERC20 tokens
     */
    function _transfer(address to, address token, uint256 amount) internal {
        if (token == address(0)) {
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "Native transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    /**
     * @dev Get dispute details
     */
    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    /**
     * @dev Get escrows for a payer
     */
    function getPayerEscrows(address payer) external view returns (uint256[] memory) {
        return payerEscrows[payer];
    }

    /**
     * @dev Get escrows for a payee
     */
    function getPayeeEscrows(address payee) external view returns (uint256[] memory) {
        return payeeEscrows[payee];
    }

    /**
     * @dev Get dispute by escrow ID
     */
    function getDisputeByEscrowId(uint256 escrowId) external view returns (Dispute memory) {
        uint256 disputeId = escrowToDispute[escrowId];
        require(disputeId != 0, "No dispute found for escrow");
        return disputes[disputeId];
    }

    /**
     * @dev Update default expiration period (owner only)
     */
    function setDefaultExpirationPeriod(uint256 _period) external onlyOwner {
        require(_period > 0, "Period must be greater than 0");
        defaultExpirationPeriod = _period;
    }

    /**
     * @dev Update minimum escrow amount (owner only)
     */
    function setMinEscrowAmount(uint256 _amount) external onlyOwner {
        minEscrowAmount = _amount;
    }

    /**
     * @dev Update token addresses (owner only)
     */
    function setTokenAddresses(address _cUSD, address _cEUR) external onlyOwner {
        cUSDToken = _cUSD;
        cEURToken = _cEUR;
    }

    // Allow contract to receive native CELO
    receive() external payable {}
}
