// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PaymentEscrow
 * @dev Secure, gas-optimized escrow with dispute resolution and multi-token support
 */
contract PaymentEscrowV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum EscrowStatus { Pending, Released, Refunded, Disputed, PartiallyRefunded, Expired }
    enum DisputeStatus { None, Filed, Resolved, Rejected }

    error EscrowNotFound();
    error InvalidAmount();
    error InvalidAddress();
    error InvalidTimeRange();
    error UnauthorizedAccess();
    error InvalidStatus();
    error DisputeNotFound();
    error InvalidToken();
    error AmountMismatch();

    struct Escrow {
        address payer;
        address payee;
        address token;
        uint256 amount;
        uint256 releasedAmount;
        uint256 refundedAmount;
        uint256 releaseTime;
        uint256 expirationTime;
        EscrowStatus status;
        DisputeStatus disputeStatus;
    }

    struct Dispute {
        uint256 escrowId;
        address filedBy;
        string reason;
        bytes32 evidenceHash;
        uint256 filedAt;
        address resolvedBy;
        bool refundApproved;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public escrowToDispute;
    mapping(address => uint256[]) public payerEscrows;
    mapping(address => uint256[]) public payeeEscrows;

    uint256 public escrowCounter;
    uint256 public disputeCounter;
    uint256 public defaultExpirationPeriod = 30 days;
    uint256 public minEscrowAmount;
    address public cUSDToken;
    address public cEURToken;

    event EscrowCreated(uint256 indexed escrowId, uint256 indexed bookingId, address indexed payer, address payee, uint256 amount, address token, uint256 releaseTime);
    event EscrowReleased(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event PartialRefund(uint256 indexed escrowId, uint256 refundAmount, uint256 releaseAmount);
    event EscrowExpired(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event DisputeFiled(uint256 indexed disputeId, uint256 indexed escrowId, address indexed filedBy);
    event DisputeResolved(uint256 indexed disputeId, uint256 indexed escrowId, bool refundApproved);

    modifier validEscrow(uint256 escrowId) {
        if (escrows[escrowId].payer == address(0)) revert EscrowNotFound();
        _;
    }

    modifier validDispute(uint256 disputeId) {
        if (disputes[disputeId].filedBy == address(0)) revert DisputeNotFound();
        _;
    }

    constructor(address _cUSD, address _cEUR) Ownable(msg.sender) {
        cUSDToken = _cUSD;
        cEURToken = _cEUR;
    }

    function createEscrow(
        uint256 bookingId,
        address payee,
        uint256 releaseTime,
        uint256 expirationTime
    ) external payable nonReentrant returns (uint256) {
        if (payee == address(0)) revert InvalidAddress();
        if (msg.value <= minEscrowAmount) revert InvalidAmount();
        if (releaseTime <= block.timestamp) revert InvalidTimeRange();

        uint256 expiration = expirationTime == 0 ? block.timestamp + defaultExpirationPeriod : expirationTime;
        if (expiration <= releaseTime) revert InvalidTimeRange();

        uint256 escrowId = ++escrowCounter;
        escrows[escrowId] = Escrow({
            payer: msg.sender,
            payee: payee,
            token: address(0),
            amount: msg.value,
            releasedAmount: 0,
            refundedAmount: 0,
            releaseTime: releaseTime,
            expirationTime: expiration,
            status: EscrowStatus.Pending,
            disputeStatus: DisputeStatus.None
        });

        payerEscrows[msg.sender].push(escrowId);
        payeeEscrows[payee].push(escrowId);

        emit EscrowCreated(escrowId, bookingId, msg.sender, payee, msg.value, address(0), releaseTime);
        return escrowId;
    }

    function createEscrowERC20(
        uint256 bookingId,
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        uint256 expirationTime
    ) external nonReentrant returns (uint256) {
        if (payee == address(0) || token == address(0)) revert InvalidAddress();
        if (amount <= minEscrowAmount) revert InvalidAmount();
        if (releaseTime <= block.timestamp) revert InvalidTimeRange();
        if (token != cUSDToken && token != cEURToken) revert InvalidToken();

        uint256 expiration = expirationTime == 0 ? block.timestamp + defaultExpirationPeriod : expirationTime;
        if (expiration <= releaseTime) revert InvalidTimeRange();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 escrowId = ++escrowCounter;
        escrows[escrowId] = Escrow({
            payer: msg.sender,
            payee: payee,
            token: token,
            amount: amount,
            releasedAmount: 0,
            refundedAmount: 0,
            releaseTime: releaseTime,
            expirationTime: expiration,
            status: EscrowStatus.Pending,
            disputeStatus: DisputeStatus.None
        });

        payerEscrows[msg.sender].push(escrowId);
        payeeEscrows[payee].push(escrowId);

        emit EscrowCreated(escrowId, bookingId, msg.sender, payee, amount, token, releaseTime);
        return escrowId;
    }

    function releaseEscrow(uint256 escrowId) external nonReentrant validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Pending) revert InvalidStatus();
        if (block.timestamp < escrow.releaseTime) revert InvalidTimeRange();
        if (escrow.disputeStatus == DisputeStatus.Filed) revert InvalidStatus();
        if (msg.sender != escrow.payee && msg.sender != owner()) revert UnauthorizedAccess();

        escrow.status = EscrowStatus.Released;
        escrow.releasedAmount = escrow.amount;

        _transfer(escrow.payee, escrow.token, escrow.amount);
        emit EscrowReleased(escrowId, escrow.payee, escrow.amount);
    }

    function automaticRelease(uint256 escrowId) external nonReentrant validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Pending) revert InvalidStatus();
        if (block.timestamp < escrow.releaseTime + 1 hours) revert InvalidTimeRange();
        if (escrow.disputeStatus == DisputeStatus.Filed) revert InvalidStatus();

        escrow.status = EscrowStatus.Released;
        escrow.releasedAmount = escrow.amount;

        _transfer(escrow.payee, escrow.token, escrow.amount);
        emit EscrowReleased(escrowId, escrow.payee, escrow.amount);
    }

    function refundEscrow(uint256 escrowId) external nonReentrant validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Pending) revert InvalidStatus();
        if (msg.sender != escrow.payer && msg.sender != escrow.payee && msg.sender != owner()) 
            revert UnauthorizedAccess();

        escrow.status = EscrowStatus.Refunded;
        escrow.refundedAmount = escrow.amount;

        _transfer(escrow.payer, escrow.token, escrow.amount);
        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    function partialRefund(
        uint256 escrowId,
        uint256 refundAmount,
        uint256 releaseAmount
    ) external onlyOwner nonReentrant validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Pending) revert InvalidStatus();
        if (refundAmount + releaseAmount != escrow.amount) revert AmountMismatch();
        if (refundAmount == 0 || releaseAmount == 0) revert InvalidAmount();

        escrow.status = EscrowStatus.PartiallyRefunded;
        escrow.refundedAmount = refundAmount;
        escrow.releasedAmount = releaseAmount;

        _transfer(escrow.payer, escrow.token, refundAmount);
        _transfer(escrow.payee, escrow.token, releaseAmount);
        emit PartialRefund(escrowId, refundAmount, releaseAmount);
    }

    function fileDispute(
        uint256 escrowId,
        string calldata reason,
        bytes32 evidenceHash
    ) external nonReentrant validEscrow(escrowId) returns (uint256) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Pending) revert InvalidStatus();
        if (msg.sender != escrow.payer && msg.sender != escrow.payee) revert UnauthorizedAccess();
        if (escrow.disputeStatus != DisputeStatus.None) revert InvalidStatus();
        if (bytes(reason).length == 0) revert InvalidAmount();

        uint256 disputeId = ++disputeCounter;
        escrow.disputeStatus = DisputeStatus.Filed;
        escrow.status = EscrowStatus.Disputed;

        disputes[disputeId] = Dispute({
            escrowId: escrowId,
            filedBy: msg.sender,
            reason: reason,
            evidenceHash: evidenceHash,
            filedAt: block.timestamp,
            resolvedBy: address(0),
            refundApproved: false
        });

        escrowToDispute[escrowId] = disputeId;
        emit DisputeFiled(disputeId, escrowId, msg.sender);
        return disputeId;
    }

    function resolveDispute(
        uint256 disputeId,
        bool refundApproved,
        uint256 refundAmount,
        uint256 releaseAmount
    ) external onlyOwner nonReentrant validDispute(disputeId) {
        Dispute storage dispute = disputes[disputeId];
        if (dispute.resolvedBy != address(0)) revert InvalidStatus();

        Escrow storage escrow = escrows[dispute.escrowId];
        if (escrow.status != EscrowStatus.Disputed) revert InvalidStatus();

        dispute.resolvedBy = msg.sender;
        dispute.refundApproved = refundApproved;
        escrow.disputeStatus = DisputeStatus.Resolved;

        if (refundApproved) {
            if (refundAmount == 0 && releaseAmount == 0) {
                escrow.status = EscrowStatus.Refunded;
                escrow.refundedAmount = escrow.amount;
                _transfer(escrow.payer, escrow.token, escrow.amount);
                emit EscrowRefunded(dispute.escrowId, escrow.payer, escrow.amount);
            } else {
                if (refundAmount + releaseAmount != escrow.amount) revert AmountMismatch();
                escrow.status = EscrowStatus.PartiallyRefunded;
                escrow.refundedAmount = refundAmount;
                escrow.releasedAmount = releaseAmount;
                _transfer(escrow.payer, escrow.token, refundAmount);
                _transfer(escrow.payee, escrow.token, releaseAmount);
                emit PartialRefund(dispute.escrowId, refundAmount, releaseAmount);
            }
        } else {
            escrow.status = EscrowStatus.Released;
            escrow.releasedAmount = escrow.amount;
            _transfer(escrow.payee, escrow.token, escrow.amount);
            emit EscrowReleased(dispute.escrowId, escrow.payee, escrow.amount);
        }

        emit DisputeResolved(disputeId, dispute.escrowId, refundApproved);
    }

    function handleExpiredEscrow(uint256 escrowId) external nonReentrant validEscrow(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Pending) revert InvalidStatus();
        if (block.timestamp < escrow.expirationTime) revert InvalidTimeRange();
        if (escrow.disputeStatus == DisputeStatus.Filed) revert InvalidStatus();

        escrow.status = EscrowStatus.Expired;
        _transfer(escrow.payer, escrow.token, escrow.amount);
        emit EscrowExpired(escrowId, escrow.payer, escrow.amount);
    }

    function _transfer(address to, address token, uint256 amount) internal {
        if (token == address(0)) {
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    function getPayerEscrows(address payer) external view returns (uint256[] memory) {
        return payerEscrows[payer];
    }

    function getPayeeEscrows(address payee) external view returns (uint256[] memory) {
        return payeeEscrows[payee];
    }

    function getDisputeByEscrowId(uint256 escrowId) external view returns (Dispute memory) {
        uint256 disputeId = escrowToDispute[escrowId];
        if (disputeId == 0) revert DisputeNotFound();
        return disputes[disputeId];
    }

    function setDefaultExpirationPeriod(uint256 period) external onlyOwner {
        if (period == 0) revert InvalidAmount();
        defaultExpirationPeriod = period;
    }

    function setMinEscrowAmount(uint256 amount) external onlyOwner {
        minEscrowAmount = amount;
    }

    function setTokenAddresses(address _cUSD, address _cEUR) external onlyOwner {
        if (_cUSD == address(0) || _cEUR == address(0)) revert InvalidAddress();
        cUSDToken = _cUSD;
        cEURToken = _cEUR;
    }

    receive() external payable {}
}