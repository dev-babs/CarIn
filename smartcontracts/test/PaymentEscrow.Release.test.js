const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentEscrow - Release and Refund", function () {
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

  describe("Release Escrow", function () {
    it("Should release escrow to payee after release time", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      await time.increaseTo(releaseTime);

      const initialBalance = await ethers.provider.getBalance(payee.address);
      await paymentEscrow.connect(payee).releaseEscrow(1);
      const finalBalance = await ethers.provider.getBalance(payee.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should revert if release time not reached", async function () {
      const releaseTime = (await time.latest()) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: ethers.parseEther("1.0")
      });

      await expect(
        paymentEscrow.connect(payee).releaseEscrow(1)
      ).to.be.revertedWith("Release time not reached");
    });
  });
});




