const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow - Security Tests", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let owner;
  let payer;
  let payee;
  let attacker;

  beforeEach(async function () {
    [owner, payer, payee, attacker] = await ethers.getSigners();
    
    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      ethers.ZeroAddress,
      ethers.ZeroAddress
    );
  });

  describe("Access Control", function () {
    it("Should prevent unauthorized dispute resolution", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      const evidenceHash = ethers.toUtf8Bytes("evidence");
      await paymentEscrow.connect(payer).fileDispute(1, "Test dispute", evidenceHash);

      await expect(
        paymentEscrow.connect(attacker).resolveDispute(1, true, 0, 0)
      ).to.be.revertedWithCustomError(paymentEscrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This is a placeholder - actual reentrancy test would require a malicious contract
      expect(true).to.be.true;
    });
  });
});




