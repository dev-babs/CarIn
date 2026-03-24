const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentEscrow - Automatic Release", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let payer;
  let payee;
  let anyUser;

  beforeEach(async function () {
    [payer, payee, anyUser] = await ethers.getSigners();
    
    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      ethers.ZeroAddress,
      ethers.ZeroAddress
    );
  });

  describe("Automatic Release", function () {
    it("Should automatically release escrow after grace period", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      // Fast forward past release time + 1 hour grace period
      await time.increase(7200); // 2 hours

      const initialBalance = await ethers.provider.getBalance(payee.address);
      await paymentEscrow.connect(anyUser).automaticRelease(1);
      const finalBalance = await ethers.provider.getBalance(payee.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should revert if grace period not met", async function () {
      const releaseTime = (await time.latest()) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: ethers.parseEther("1.0")
      });

      await time.increaseTo(releaseTime);

      await expect(
        paymentEscrow.connect(anyUser).automaticRelease(1)
      ).to.be.revertedWith("Automatic release requires 1 hour grace period");
    });
  });
});




