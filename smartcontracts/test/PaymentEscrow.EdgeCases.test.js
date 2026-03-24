const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow - Edge Cases", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let payer;
  let payee;

  beforeEach(async function () {
    [payer, payee] = await ethers.getSigners();
    
    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      ethers.ZeroAddress,
      ethers.ZeroAddress
    );
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount escrows correctly", async function () {
      await paymentEscrow.setMinEscrowAmount(0);
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      
      // This should fail as amount must be greater than 0
      await expect(
        paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
          value: 0
        })
      ).to.be.reverted;
    });

    it("Should prevent duplicate dispute filing", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      const evidenceHash = ethers.toUtf8Bytes("evidence");
      await paymentEscrow.connect(payer).fileDispute(1, "First dispute", evidenceHash);

      await expect(
        paymentEscrow.connect(payer).fileDispute(1, "Second dispute", evidenceHash)
      ).to.be.revertedWith("Dispute already filed");
    });
  });
});




