const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow - ERC20 Token Support", function () {
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

  describe("ERC20 Escrow", function () {
    it("Should create escrow with cUSD token", async function () {
      const amount = ethers.parseEther("100");
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      
      await cUSDToken.connect(payer).approve(await paymentEscrow.getAddress(), amount);
      
      await expect(
        paymentEscrow.connect(payer).createEscrowERC20(
          1,
          payee.address,
          await cUSDToken.getAddress(),
          amount,
          releaseTime,
          0
        )
      ).to.emit(paymentEscrow, "EscrowCreated");
    });
  });
});




