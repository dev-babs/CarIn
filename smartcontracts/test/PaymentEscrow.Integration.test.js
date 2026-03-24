const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentEscrow - Integration Tests", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let owner;
  let payer;
  let payee;
  let cUSDToken;

  beforeEach(async function () {
    [owner, payer, payee] = await ethers.getSigners();
    
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cUSDToken = await MockERC20.deploy("Celo Dollar", "cUSD", 18);

    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      await cUSDToken.getAddress(),
      ethers.ZeroAddress
    );
  });

  describe("Full Escrow Lifecycle", function () {
    it("Should complete full lifecycle: create -> dispute -> resolve -> refund", async function () {
      // 1. Create escrow
      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      // 2. File dispute
      const evidenceHash = ethers.toUtf8Bytes("QmEvidence");
      await paymentEscrow.connect(payer).fileDispute(1, "Service issue", evidenceHash);

      // 3. Resolve dispute with partial refund
      const refundAmount = ethers.parseEther("0.4");
      const releaseAmount = ethers.parseEther("0.6");
      
      await paymentEscrow.connect(owner).resolveDispute(1, true, refundAmount, releaseAmount);

      // Verify final state
      const escrow = await paymentEscrow.getEscrow(1);
      expect(escrow.status).to.equal(2); // PartiallyRefunded
    });
  });
});




