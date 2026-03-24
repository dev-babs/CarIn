// Test helpers for PaymentEscrow contract

const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Create an escrow with native CELO
 */
async function createNativeEscrow(paymentEscrow, payer, payee, bookingId, amount, hoursUntilRelease = 1) {
  const releaseTime = (await time.latest()) + (hoursUntilRelease * 3600);
  
  const tx = await paymentEscrow.connect(payer).createEscrow(
    bookingId,
    payee.address,
    releaseTime,
    0, // Use default expiration
    { value: amount }
  );
  
  await tx.wait();
  return tx;
}

/**
 * Fast forward time
 */
async function fastForward(hours) {
  await time.increase(hours * 3600);
}

/**
 * Get current timestamp
 */
async function getCurrentTime() {
  return await time.latest();
}

module.exports = {
  createNativeEscrow,
  fastForward,
  getCurrentTime
};




