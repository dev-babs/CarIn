const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow - Partial Refund", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let owner;
  let payer;
  let payee;

  beforeEach(async function () {
    [owner, payer, payee] = await ethers.getSigners();
    
    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      ethers.ZeroAddress,
      ethers.ZeroAddress
    );
  });

  describe("Partial Refund", function () {
    it("Should allow owner to perform partial refund", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      const refundAmount = ethers.parseEther("0.3");
      const releaseAmount = ethers.parseEther("0.7");

      await expect(
        paymentEscrow.connect(owner).partialRefund(1, refundAmount, releaseAmount)
      ).to.emit(paymentEscrow, "PartialRefund");
    });
  });
});




