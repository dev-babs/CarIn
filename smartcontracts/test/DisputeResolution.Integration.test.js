const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DisputeResolution Integration", function () {
  let disputeResolution;
  let paymentEscrow;
  let parkingSpot;
  let owner, payer, payee, moderator;
  let mockERC20;
  let escrowId;
  let bookingId;

  beforeEach(async function () {
    [owner, payer, payee, moderator] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Test Token", "TEST", ethers.parseEther("1000000"));

    const ParkingSpot = await ethers.getContractFactory("ParkingSpot");
    parkingSpot = await ParkingSpot.deploy();

    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      mockERC20.target,
      mockERC20.target
    );

    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.deploy(
      paymentEscrow.target,
      parkingSpot.target
    );

    await disputeResolution.addModerator(moderator.address);

    // Create booking and escrow
    await parkingSpot.connect(payee).listSpot("Test Location", ethers.parseEther("1"));
    bookingId = 1;
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    await parkingSpot.connect(payer).createBooking(1, futureTime, futureTime + 7200);
    
    await mockERC20.connect(payer).approve(paymentEscrow.target, ethers.parseEther("1000"));
    await paymentEscrow.connect(payer).createEscrowERC20(
      1,
      payee.address,
      mockERC20.target,
      ethers.parseEther("10"),
      futureTime + 7200,
      futureTime + 86400
    );
    escrowId = 1;
  });

  it("Should handle complete dispute resolution flow", async function () {
    // 1. File dispute
    const reason = "Late check-in";
    const evidenceHash = ethers.toUtf8Bytes("QmHash123");
    await disputeResolution.connect(payer).fileDispute(
      escrowId,
      bookingId,
      reason,
      evidenceHash,
      0 // CheckInTimestamp
    );

    // 2. Add evidence
    const additionalEvidence = ethers.toUtf8Bytes("QmHash456");
    await disputeResolution.connect(payer).submitEvidence(
      1, // disputeId
      2, // Image type
      additionalEvidence,
      "Photo of parking spot"
    );

    // 3. Moderator resolves
    await disputeResolution.connect(moderator).resolveDisputeManually(
      1,
      true, // refund approved
      50 // 50% refund
    );

    // 4. Verify resolution
    const dispute = await disputeResolution.getDispute(1);
    expect(dispute.isResolved).to.be.true;
    expect(dispute.refundApproved).to.be.true;
    expect(dispute.refundPercentage).to.equal(50);
  });

  it("Should handle automated late check-in resolution", async function () {
    const futureTime = Math.floor(Date.now() / 1000) + 100;
    await time.increaseTo(futureTime);

    // File dispute
    await disputeResolution.connect(payer).fileDispute(
      escrowId,
      bookingId,
      "Late check-in",
      ethers.toUtf8Bytes("QmHash"),
      0
    );

    // Record late check-in (31 minutes late)
    const lateCheckIn = futureTime + 1860; // 31 minutes
    await time.increaseTo(lateCheckIn);
    await disputeResolution.connect(payee).recordCheckIn(bookingId, lateCheckIn);

    // Should trigger automated resolution
    const dispute = await disputeResolution.getDispute(1);
    expect(dispute.isResolved).to.be.true;
  });

  it("Should handle check-in and check-out flow", async function () {
    const checkInTime = Math.floor(Date.now() / 1000) + 100;
    await time.increaseTo(checkInTime);

    await disputeResolution.connect(payee).recordCheckIn(bookingId, checkInTime);
    
    const checkInData = await disputeResolution.getCheckInData(bookingId);
    expect(checkInData.checkedIn).to.be.true;
    expect(checkInData.checkInTime).to.equal(checkInTime);

    const checkOutTime = checkInTime + 3600;
    await time.increaseTo(checkOutTime);
    await disputeResolution.connect(payee).recordCheckOut(bookingId, checkOutTime);

    const updatedCheckInData = await disputeResolution.getCheckInData(bookingId);
    expect(updatedCheckInData.checkedOut).to.be.true;
    expect(updatedCheckInData.checkOutTime).to.equal(checkOutTime);
  });
});

