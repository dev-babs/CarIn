const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardsToken", function () {
  let rewardsToken;
  let owner;
  let rewardsManager;
  let user1;
  let user2;

  const TOKEN_NAME = "CarIn Rewards Token";
  const TOKEN_SYMBOL = "CARIN";
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  const MAX_SUPPLY = ethers.parseEther("10000000"); // 10M tokens

  beforeEach(async function () {
    [owner, rewardsManager, user1, user2] = await ethers.getSigners();

    const RewardsToken = await ethers.getContractFactory("RewardsToken");
    rewardsToken = await RewardsToken.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      INITIAL_SUPPLY,
      MAX_SUPPLY
    );
    await rewardsToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await rewardsToken.name()).to.equal(TOKEN_NAME);
      expect(await rewardsToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should mint initial supply to owner", async function () {
      expect(await rewardsToken.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await rewardsToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set max supply", async function () {
      expect(await rewardsToken.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should set deployer as initial rewards manager", async function () {
      expect(await rewardsToken.rewardsManager()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow rewards manager to mint tokens", async function () {
      await rewardsToken.setRewardsManager(rewardsManager.address);
      
      const mintAmount = ethers.parseEther("1000");
      await expect(rewardsToken.connect(rewardsManager).mint(user1.address, mintAmount, "Test reward"))
        .to.emit(rewardsToken, "TokensMinted")
        .withArgs(user1.address, mintAmount, "Test reward");

      expect(await rewardsToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should reject minting from non-manager", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        rewardsToken.connect(user1).mint(user2.address, mintAmount, "Test")
      ).to.be.revertedWith("RewardsToken: Only RewardsManager can mint");
    });

    it("Should enforce max supply", async function () {
      await rewardsToken.setRewardsManager(rewardsManager.address);
      
      const remainingSupply = MAX_SUPPLY - INITIAL_SUPPLY;
      const excessAmount = remainingSupply + ethers.parseEther("1");

      await expect(
        rewardsToken.connect(rewardsManager).mint(user1.address, excessAmount, "Test")
      ).to.be.revertedWith("RewardsToken: Would exceed max supply");
    });

    it("Should allow unlimited supply when maxSupply is 0", async function () {
      const RewardsToken = await ethers.getContractFactory("RewardsToken");
      const unlimitedToken = await RewardsToken.deploy(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        0,
        0 // No max supply
      );
      await unlimitedToken.waitForDeployment();

      await unlimitedToken.setRewardsManager(rewardsManager.address);
      
      const largeAmount = ethers.parseEther("1000000000"); // 1B tokens
      await unlimitedToken.connect(rewardsManager).mint(user1.address, largeAmount, "Test");
      
      expect(await unlimitedToken.balanceOf(user1.address)).to.equal(largeAmount);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await rewardsToken.pause();
      expect(await rewardsToken.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      await rewardsToken.setRewardsManager(rewardsManager.address);
      await rewardsToken.connect(rewardsManager).mint(user1.address, ethers.parseEther("100"), "Test");
      
      await rewardsToken.pause();
      
      await expect(
        rewardsToken.connect(user1).transfer(user2.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(rewardsToken, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await rewardsToken.pause();
      await rewardsToken.unpause();
      expect(await rewardsToken.paused()).to.be.false;
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await rewardsToken.setRewardsManager(rewardsManager.address);
      await rewardsToken.connect(rewardsManager).mint(user1.address, ethers.parseEther("1000"), "Test");
    });

    it("Should allow users to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      await rewardsToken.connect(user1).burn(burnAmount);
      
      expect(await rewardsToken.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
      expect(await rewardsToken.totalSupply()).to.equal(INITIAL_SUPPLY + ethers.parseEther("900"));
    });

    it("Should prevent burning more than balance", async function () {
      const burnAmount = ethers.parseEther("2000");
      await expect(
        rewardsToken.connect(user1).burn(burnAmount)
      ).to.be.revertedWithCustomError(rewardsToken, "ERC20InsufficientBalance");
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update rewards manager", async function () {
      await rewardsToken.setRewardsManager(rewardsManager.address);
      expect(await rewardsToken.rewardsManager()).to.equal(rewardsManager.address);
    });

    it("Should prevent setting invalid rewards manager", async function () {
      await expect(
        rewardsToken.setRewardsManager(ethers.ZeroAddress)
      ).to.be.revertedWith("RewardsToken: Invalid address");
    });

    it("Should allow owner to update max supply", async function () {
      const newMaxSupply = ethers.parseEther("5000000");
      await rewardsToken.setMaxSupply(newMaxSupply);
      expect(await rewardsToken.maxSupply()).to.equal(newMaxSupply);
    });

    it("Should prevent setting max supply below current supply", async function () {
      const lowMaxSupply = INITIAL_SUPPLY - ethers.parseEther("1");
      await expect(
        rewardsToken.setMaxSupply(lowMaxSupply)
      ).to.be.revertedWith("RewardsToken: Max supply below current supply");
    });
  });
});




