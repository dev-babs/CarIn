const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow - Escrow Creation", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let owner;
  let payer;
  let payee;
  let cUSDToken;
  let cEURToken;

  beforeEach(async function () {
    [owner, payer, payee] = await ethers.getSigners();
    
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cUSDToken = await MockERC20.deploy("Celo Dollar", "cUSD", 18);
    cEURToken = await MockERC20.deploy("Celo Euro", "cEUR", 18);

    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      await cUSDToken.getAddress(),
      await cEURToken.getAddress()
    );
  });

  describe("Native CELO Escrow", function () {
    it("Should create escrow with native CELO", async function () {
      const bookingId = 1;
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      const amount = ethers.parseEther("1.0");

      await expect(
        paymentEscrow.connect(payer).createEscrow(
          bookingId,
          payee.address,
          releaseTime,
          0,
          { value: amount }
        )
      ).to.emit(paymentEscrow, "EscrowCreated")
        .withArgs(1, bookingId, payer.address, payee.address, amount, ethers.ZeroAddress, releaseTime);
    });

    it("Should revert if payee is zero address", async function () {
      await expect(
        paymentEscrow.connect(payer).createEscrow(1, ethers.ZeroAddress, Math.floor(Date.now() / 1000) + 3600, 0, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Invalid payee address");
    });

    it("Should revert if amount is below minimum", async function () {
      await paymentEscrow.setMinEscrowAmount(ethers.parseEther("0.1"));
      await expect(
        paymentEscrow.connect(payer).createEscrow(1, payee.address, Math.floor(Date.now() / 1000) + 3600, 0, {
          value: ethers.parseEther("0.05")
        })
      ).to.be.revertedWith("Amount below minimum");
    });
  });
});




