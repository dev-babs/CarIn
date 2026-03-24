const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentEscrow - Expiration Handling", function () {
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

  describe("Expired Escrows", function () {
    it("Should allow refund of expired escrow", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;
      const expirationTime = (await time.latest()) + 7200;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, expirationTime, {
        value: amount
      });

      await time.increaseTo(expirationTime + 1);

      await expect(
        paymentEscrow.connect(payer).handleExpiredEscrow(1)
      ).to.emit(paymentEscrow, "EscrowExpired");
    });
  });
});




