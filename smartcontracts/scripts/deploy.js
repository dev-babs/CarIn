const hre = require("hardhat");

async function main() {
  console.log("Deploying CarIn contracts...");

  // Deploy ParkingSpot contract
  const ParkingSpot = await hre.ethers.getContractFactory("ParkingSpot");
  const parkingSpot = await ParkingSpot.deploy();
  await parkingSpot.waitForDeployment();
  const parkingSpotAddress = await parkingSpot.getAddress();
  console.log("ParkingSpot deployed to:", parkingSpotAddress);

  // Deploy PaymentEscrow contract
  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy();
  await paymentEscrow.waitForDeployment();
  const paymentEscrowAddress = await paymentEscrow.getAddress();
  console.log("PaymentEscrow deployed to:", paymentEscrowAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("ParkingSpot:", parkingSpotAddress);
  console.log("PaymentEscrow:", paymentEscrowAddress);
  console.log("\nSave these addresses for frontend integration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




