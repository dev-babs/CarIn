const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DisputeResolution Edge Cases", function () {
  let disputeResolution;
  let paymentEscrow;
  let parkingSpot;
  let owner, payer, payee, moderator, unauthorized;
  let mockERC20;

  beforeEach(async function () {
    [owner, payer, payee, moderator, unauthorized] = await ethers.getSigners();

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

    await parkingSpot.connect(payee).listSpot("Test Location", ethers.parseEther("1"));
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
  });

  it("Should prevent double check-in recording", async function () {
    await disputeResolution.connect(payee).recordCheckIn(1, Math.floor(Date.now() / 1000));
    
    await expect(
      disputeResolution.connect(payee).recordCheckIn(1, Math.floor(Date.now() / 1000) + 100)
    ).to.be.reverted;
  });

  it("Should prevent check-out without check-in", async function () {
    await expect(
      disputeResolution.connect(payee).recordCheckOut(1, Math.floor(Date.now() / 1000))
    ).to.be.reverted;
  });

  it("Should prevent unauthorized check-in recording", async function () {
    await expect(
      disputeResolution.connect(unauthorized).recordCheckIn(1, Math.floor(Date.now() / 1000))
    ).to.be.reverted;
  });

  it("Should prevent filing duplicate disputes", async function () {
    await disputeResolution.connect(payer).fileDispute(
      1, 1, "Test", ethers.toUtf8Bytes("hash"), 0
    );

    await expect(
      disputeResolution.connect(payer).fileDispute(
        1, 1, "Test", ethers.toUtf8Bytes("hash2"), 0
      )
    ).to.be.reverted;
  });

  it("Should prevent submitting evidence to resolved dispute", async function () {
    await disputeResolution.connect(payer).fileDispute(
      1, 1, "Test", ethers.toUtf8Bytes("hash"), 0
    );

    await disputeResolution.connect(moderator).resolveDisputeManually(1, true, 100);

    await expect(
      disputeResolution.connect(payer).submitEvidence(
        1, 2, ethers.toUtf8Bytes("hash2"), "More evidence"
      )
    ).to.be.reverted;
  });

  it("Should prevent voting on non-voting disputes", async function () {
    await disputeResolution.connect(payer).fileDispute(
      1, 1, "Test", ethers.toUtf8Bytes("hash"), 0
    );

    await disputeResolution.authorizeVoter(unauthorized.address);

    await expect(
      disputeResolution.connect(unauthorized).submitVote(
        1, true, 100, "Justification"
      )
    ).to.be.reverted;
  });

  it("Should handle zero refund percentage correctly", async function () {
    await disputeResolution.connect(payer).fileDispute(
      1, 1, "Test", ethers.toUtf8Bytes("hash"), 0
    );

    await expect(
      disputeResolution.connect(moderator).resolveDisputeManually(1, false, 0)
    ).to.emit(disputeResolution, "DisputeResolved");
  });

  it("Should prevent invalid refund percentages", async function () {
    await disputeResolution.connect(payer).fileDispute(
      1, 1, "Test", ethers.toUtf8Bytes("hash"), 0
    );

    await expect(
      disputeResolution.connect(moderator).resolveDisputeManually(1, true, 101)
    ).to.be.revertedWith("Invalid refund percentage");
  });
});




