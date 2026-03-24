const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow - Dispute Resolution", function () {
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

  describe("File Dispute", function () {
    it("Should allow payer to file dispute", async function () {
      const amount = ethers.parseEther("1.0");
      const releaseTime = Math.floor(Date.now() / 1000) + 3600;
      
      await paymentEscrow.connect(payer).createEscrow(1, payee.address, releaseTime, 0, {
        value: amount
      });

      const evidenceHash = ethers.toUtf8Bytes("QmExampleIPFSHash");
      await expect(
        paymentEscrow.connect(payer).fileDispute(1, "Service not provided", evidenceHash)
      ).to.emit(paymentEscrow, "DisputeFiled");
    });
  });
});




