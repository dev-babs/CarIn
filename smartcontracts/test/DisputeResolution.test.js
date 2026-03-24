const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DisputeResolution", function () {
  let disputeResolution;
  let paymentEscrow;
  let parkingSpot;
  let owner, payer, payee, moderator, voter;
  let mockERC20;

  beforeEach(async function () {
    [owner, payer, payee, moderator, voter] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));

    // Deploy ParkingSpot
    const ParkingSpot = await ethers.getContractFactory("ParkingSpot");
    parkingSpot = await ParkingSpot.deploy();

    // Deploy PaymentEscrow
    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      mockERC20.target,
      mockERC20.target // cEUR same as cUSD for testing
    );

    // Deploy DisputeResolution
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.deploy(
      paymentEscrow.target,
      parkingSpot.target
    );

    // Add moderator
    await disputeResolution.addModerator(moderator.address);
    
    // Authorize voter
    await disputeResolution.authorizeVoter(voter.address);

    // Create a spot and booking for testing
    await parkingSpot.connect(payee).listSpot("Test Location", ethers.parseEther("1"));
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    await parkingSpot.connect(payer).createBooking(1, futureTime, futureTime + 7200);
    
    // Create escrow
    await paymentEscrow.connect(payer).createEscrowERC20(
      1,
      payee.address,
      mockERC20.target,
      ethers.parseEther("10"),
      futureTime + 7200,
      futureTime + 86400
    );

    // Approve escrow contract to spend tokens
    await mockERC20.connect(payer).approve(paymentEscrow.target, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set correct payment escrow address", async function () {
      expect(await disputeResolution.paymentEscrow()).to.equal(paymentEscrow.target);
    });

    it("Should set correct parking spot address", async function () {
      expect(await disputeResolution.parkingSpot()).to.equal(parkingSpot.target);
    });
  });

  describe("Check-in/Check-out Recording", function () {
    it("Should allow spot owner to record check-in", async function () {
      const bookingId = 1;
      const checkInTime = Math.floor(Date.now() / 1000);
      
      await expect(disputeResolution.connect(payee).recordCheckIn(bookingId, checkInTime))
        .to.emit(disputeResolution, "CheckInRecorded")
        .withArgs(bookingId, checkInTime, payee.address);
    });

    it("Should allow spot owner to record check-out", async function () {
      const bookingId = 1;
      const checkInTime = Math.floor(Date.now() / 1000);
      const checkOutTime = checkInTime + 3600;

      await disputeResolution.connect(payee).recordCheckIn(bookingId, checkInTime);
      
      await expect(disputeResolution.connect(payee).recordCheckOut(bookingId, checkOutTime))
        .to.emit(disputeResolution, "CheckOutRecorded")
        .withArgs(bookingId, checkOutTime, payee.address);
    });
  });

  describe("Filing Disputes", function () {
    it("Should allow payer to file dispute", async function () {
      const escrowId = 1;
      const bookingId = 1;
      const reason = "Test dispute";
      const evidenceHash = ethers.toUtf8Bytes("QmHash123");
      const evidenceType = 2; // Image

      await expect(disputeResolution.connect(payer).fileDispute(
        escrowId,
        bookingId,
        reason,
        evidenceHash,
        evidenceType
      )).to.emit(disputeResolution, "DisputeFiled");
    });

    it("Should reject dispute from unauthorized party", async function () {
      const escrowId = 1;
      const bookingId = 1;
      const reason = "Test dispute";
      const evidenceHash = ethers.toUtf8Bytes("QmHash123");
      const evidenceType = 2;

      await expect(
        disputeResolution.connect(owner).fileDispute(
          escrowId,
          bookingId,
          reason,
          evidenceHash,
          evidenceType
        )
      ).to.be.reverted;
    });
  });

  describe("Automated Resolution", function () {
    it("Should auto-resolve no-show disputes", async function () {
      const escrowId = 1;
      const bookingId = 1;
      const reason = "No-show";
      const evidenceHash = ethers.toUtf8Bytes("QmHash123");
      const evidenceType = 6; // Other

      // File dispute
      await disputeResolution.connect(payer).fileDispute(
        escrowId,
        bookingId,
        reason,
        evidenceHash,
        evidenceType
      );

      // Move time forward past no-show threshold
      const booking = await parkingSpot.getBooking(bookingId);
      const noShowTime = Number(booking.startTime) + 3600 + 1; // 1 hour after start
      await time.increaseTo(noShowTime);

      // Dispute should be automatically resolved
      const disputeId = 1;
      const dispute = await disputeResolution.getDispute(disputeId);
      expect(dispute.isResolved).to.be.true;
      expect(dispute.refundApproved).to.be.true;
    });
  });

  describe("Manual Resolution", function () {
    it("Should allow moderator to resolve dispute manually", async function () {
      const escrowId = 1;
      const bookingId = 1;
      const reason = "Test dispute";
      const evidenceHash = ethers.toUtf8Bytes("QmHash123");
      const evidenceType = 2;

      await disputeResolution.connect(payer).fileDispute(
        escrowId,
        bookingId,
        reason,
        evidenceHash,
        evidenceType
      );

      const disputeId = 1;

      await expect(
        disputeResolution.connect(moderator).resolveDisputeManually(
          disputeId,
          true,
          50 // 50% refund
        )
      ).to.emit(disputeResolution, "DisputeResolved");

      const dispute = await disputeResolution.getDispute(disputeId);
      expect(dispute.isResolved).to.be.true;
      expect(dispute.refundApproved).to.be.true;
      expect(dispute.refundPercentage).to.equal(50);
    });
  });

  describe("Voting Mechanism", function () {
    it("Should allow authorized voters to submit votes", async function () {
      const escrowId = 1;
      const bookingId = 1;
      const reason = "Test dispute";
      const evidenceHash = ethers.toUtf8Bytes("QmHash123");
      const evidenceType = 2;

      await disputeResolution.connect(payer).fileDispute(
        escrowId,
        bookingId,
        reason,
        evidenceHash,
        evidenceType
      );

      // Change to voting phase (would need to set resolution type or wait)
      // For testing, we'll directly test voting

      const disputeId = 1;
      
      await expect(
        disputeResolution.connect(voter).submitVote(
          disputeId,
          true, // support refund
          100, // 100% refund
          "Justification"
        )
      ).to.emit(disputeResolution, "VoteSubmitted");
    });
  });
});

