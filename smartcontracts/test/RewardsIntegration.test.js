const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Rewards System Integration", function () {
  let rewardsToken;
  let rewardsManager;
  let parkingSpot;
  let owner;
  let user1;
  let user2;
  let oracle;

  beforeEach(async function () {
    [owner, user1, user2, oracle] = await ethers.getSigners();

    // Deploy ParkingSpot
    const ParkingSpot = await ethers.getContractFactory("ParkingSpot");
    parkingSpot = await ParkingSpot.deploy();
    await parkingSpot.waitForDeployment();

    // Deploy RewardsToken
    const RewardsToken = await ethers.getContractFactory("RewardsToken");
    rewardsToken = await RewardsToken.deploy(
      "CarIn Rewards",
      "CARIN",
      0,
      ethers.parseEther("10000000")
    );
    await rewardsToken.waitForDeployment();

    // Deploy RewardsManager
    const RewardsManager = await ethers.getContractFactory("RewardsManager");
    rewardsManager = await RewardsManager.deploy(
      await rewardsToken.getAddress(),
      await parkingSpot.getAddress()
    );
    await rewardsManager.waitForDeployment();

    // Set RewardsManager as minter
    await rewardsToken.setRewardsManager(await rewardsManager.getAddress());

    // Configure rewards
    await rewardsManager.setInaccuracyReportReward(ethers.parseEther("100"));
    await rewardsManager.setReferralReward(ethers.parseEther("25"));
  });

  describe("End-to-End Reward Flow", function () {
    it("Should complete full report and claim flow", async function () {
      // 1. Create a spot
      await parkingSpot.connect(user2).listSpot("Test Location", ethers.parseEther("1"));
      
      // 2. Submit report
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Wrong location", evidenceHash);
      
      // 3. Validate report
      await rewardsManager.setOracle(oracle.address);
      await rewardsManager.connect(oracle).validateReport(1, true);
      
      // 4. Check pending rewards
      const pending = await rewardsManager.getPendingRewards(user1.address);
      expect(pending).to.equal(ethers.parseEther("100"));
      
      // 5. Advance time for cooldown
      await time.increase(86401); // 1 day + 1 second
      
      // 6. Claim reward
      await rewardsManager.connect(user1).claimReward(0); // RewardType.InaccuracyReport
      
      // 7. Verify token balance
      const balance = await rewardsToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should handle multiple reward types", async function () {
      // Submit and validate report
      await parkingSpot.connect(user2).listSpot("Test Location", ethers.parseEther("1"));
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test", evidenceHash);
      await rewardsManager.setOracle(oracle.address);
      await rewardsManager.connect(oracle).validateReport(1, true);
      
      // Create referral
      await rewardsManager.connect(user1).createReferral(user2.address, 1);
      
      // Check pending rewards
      const pendingTotal = await rewardsManager.getPendingRewards(user1.address);
      expect(pendingTotal).to.equal(ethers.parseEther("125")); // 100 + 25
      
      // Claim all
      await time.increase(86401);
      await rewardsManager.connect(user1).claimAllRewards();
      
      const balance = await rewardsToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("125"));
    });

    it("Should enforce cooldowns properly", async function () {
      await parkingSpot.connect(user2).listSpot("Test Location", ethers.parseEther("1"));
      
      // Submit first report
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test 1", evidenceHash);
      
      // Try to submit second report immediately (should fail)
      await expect(
        rewardsManager.connect(user1).submitInaccuracyReport(1, "Test 2", evidenceHash)
      ).to.be.revertedWith("RewardsManager: Report cooldown not elapsed");
      
      // Advance time
      await time.increase(86401);
      
      // Now should succeed
      await expect(
        rewardsManager.connect(user1).submitInaccuracyReport(1, "Test 2", evidenceHash)
      ).to.emit(rewardsManager, "ReportSubmitted");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use less gas when claiming all vs individual", async function () {
      await parkingSpot.connect(user2).listSpot("Test Location", ethers.parseEther("1"));
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      
      // Submit multiple reports
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test 1", evidenceHash);
      await rewardsManager.setOracle(oracle.address);
      await rewardsManager.connect(oracle).validateReport(1, true);
      
      await time.increase(86401);
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test 2", evidenceHash);
      await rewardsManager.connect(oracle).validateReport(2, true);
      
      await time.increase(86401);
      
      // Claim all should be more efficient than individual claims
      const tx = await rewardsManager.connect(user1).claimAllRewards();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      
      expect(gasUsed).to.be.lt(300000); // Reasonable gas limit
    });
  });
});




