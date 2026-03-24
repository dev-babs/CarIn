const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RewardsManager", function () {
  let rewardsToken;
  let rewardsManager;
  let parkingSpot;
  let owner;
  let user1;
  let user2;
  let oracle;

  const REPORT_REWARD = ethers.parseEther("100");
  const REFERRAL_REWARD = ethers.parseEther("25");
  const SPOT_SHARE_REWARD = ethers.parseEther("50");

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
    await rewardsManager.setInaccuracyReportReward(REPORT_REWARD);
    await rewardsManager.setReferralReward(REFERRAL_REWARD);
    await rewardsManager.setSpotShareReward(SPOT_SHARE_REWARD);

    // Create a test spot
    await parkingSpot.connect(user2).listSpot("Test Location", ethers.parseEther("1"));
  });

  describe("Deployment", function () {
    it("Should set correct token and parking spot addresses", async function () {
      expect(await rewardsManager.rewardsToken()).to.equal(await rewardsToken.getAddress());
      expect(await rewardsManager.parkingSpot()).to.equal(await parkingSpot.getAddress());
    });

    it("Should set initial reward amounts", async function () {
      expect(await rewardsManager.inaccuracyReportReward()).to.equal(REPORT_REWARD);
      expect(await rewardsManager.referralReward()).to.equal(REFERRAL_REWARD);
      expect(await rewardsManager.spotShareReward()).to.equal(SPOT_SHARE_REWARD);
    });
  });

  describe("Report Submission", function () {
    it("Should allow users to submit reports", async function () {
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      
      await expect(
        rewardsManager.connect(user1).submitInaccuracyReport(1, "Wrong location", evidenceHash)
      ).to.emit(rewardsManager, "ReportSubmitted")
        .withArgs(1, 1, user1.address, "Wrong location");

      const report = await rewardsManager.reports(1);
      expect(report.spotId).to.equal(1);
      expect(report.reporter).to.equal(user1.address);
      expect(report.reason).to.equal("Wrong location");
    });

    it("Should enforce cooldown period", async function () {
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test", evidenceHash);
      
      await expect(
        rewardsManager.connect(user1).submitInaccuracyReport(1, "Test 2", evidenceHash)
      ).to.be.revertedWith("RewardsManager: Report cooldown not elapsed");
    });

    it("Should reject reports for invalid spots", async function () {
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      
      await expect(
        rewardsManager.connect(user1).submitInaccuracyReport(999, "Test", evidenceHash)
      ).to.be.revertedWith("RewardsManager: Invalid spot ID");
    });
  });

  describe("Report Validation", function () {
    beforeEach(async function () {
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test", evidenceHash);
    });

    it("Should allow oracle to validate reports", async function () {
      await rewardsManager.setOracle(oracle.address);
      
      await expect(
        rewardsManager.connect(oracle).validateReport(1, true)
      ).to.emit(rewardsManager, "ReportValidated")
        .withArgs(1, true, REPORT_REWARD);

      const report = await rewardsManager.reports(1);
      expect(report.isValid).to.be.true;
      expect(report.claimStatus).to.equal(1); // Approved
      expect(report.rewardAmount).to.equal(REPORT_REWARD);
    });

    it("Should allow owner to validate reports when oracle not set", async function () {
      await expect(
        rewardsManager.connect(owner).validateReport(1, true)
      ).to.emit(rewardsManager, "ReportValidated");
    });

    it("Should reject invalid reports", async function () {
      await rewardsManager.setOracle(oracle.address);
      
      await rewardsManager.connect(oracle).validateReport(1, false);
      
      const report = await rewardsManager.reports(1);
      expect(report.isValid).to.be.false;
      expect(report.claimStatus).to.equal(2); // Rejected
    });
  });

  describe("Referrals", function () {
    it("Should allow users to create referrals", async function () {
      await expect(
        rewardsManager.connect(user1).createReferral(user2.address, 1)
      ).to.emit(rewardsManager, "ReferralCreated");

      const referralHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "address", "uint256"],
          [user1.address, user2.address, 1]
        )
      );
      
      const referral = await rewardsManager.referrals(referralHash);
      expect(referral.referrer).to.equal(user1.address);
      expect(referral.referee).to.equal(user2.address);
      expect(referral.spotId).to.equal(1);
    });

    it("Should prevent self-referrals", async function () {
      await expect(
        rewardsManager.connect(user1).createReferral(user1.address, 1)
      ).to.be.revertedWith("RewardsManager: Cannot refer yourself");
    });

    it("Should enforce referral cooldown", async function () {
      await rewardsManager.connect(user1).createReferral(user2.address, 1);
      
      await expect(
        rewardsManager.connect(user1).createReferral(user2.address, 1)
      ).to.be.revertedWith("RewardsManager: Referral cooldown not elapsed");
    });
  });

  describe("Reward Claiming", function () {
    beforeEach(async function () {
      const evidenceHash = ethers.toUtf8Bytes("ipfs://QmTestHash");
      await rewardsManager.connect(user1).submitInaccuracyReport(1, "Test", evidenceHash);
      await rewardsManager.setOracle(oracle.address);
      await rewardsManager.connect(oracle).validateReport(1, true);
    });

    it("Should allow users to claim rewards", async function () {
      await expect(
        rewardsManager.connect(user1).claimReward(0) // RewardType.InaccuracyReport
      ).to.emit(rewardsManager, "RewardClaimed")
        .to.emit(rewardsToken, "TokensMinted");

      expect(await rewardsToken.balanceOf(user1.address)).to.equal(REPORT_REWARD);
    });

    it("Should enforce claim cooldown", async function () {
      await rewardsManager.connect(user1).claimReward(0);
      
      await expect(
        rewardsManager.connect(user1).claimReward(0)
      ).to.be.revertedWith("RewardsManager: Claim cooldown not elapsed");
    });

    it("Should allow claiming all rewards", async function () {
      const referralHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "address", "uint256"],
          [user1.address, user2.address, 1]
        )
      );
      await rewardsManager.connect(user1).createReferral(user2.address, 1);
      
      // Simulate booking completion by calling activateReferralReward
      // This would normally be called by ParkingSpot contract
      // For test, we'll need to modify the contract or mock this
      
      const totalPending = await rewardsManager.getPendingRewards(user1.address);
      expect(totalPending).to.be.gt(0);
      
      await rewardsManager.connect(user1).claimAllRewards();
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update reward amounts", async function () {
      const newAmount = ethers.parseEther("200");
      await rewardsManager.setInaccuracyReportReward(newAmount);
      expect(await rewardsManager.inaccuracyReportReward()).to.equal(newAmount);
    });

    it("Should allow owner to update cooldowns", async function () {
      const newCooldown = 2 * 24 * 60 * 60; // 2 days
      await rewardsManager.setReportCooldown(newCooldown);
      expect(await rewardsManager.reportCooldown()).to.equal(newCooldown);
    });

    it("Should allow owner to pause", async function () {
      await rewardsManager.pause();
      expect(await rewardsManager.paused()).to.be.true;
    });
  });
});




