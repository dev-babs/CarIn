const hre = require("hardhat");

async function main() {
  const parkingSpotAddress = process.env.PARKING_SPOT_ADDRESS;
  const paymentEscrowAddress = process.env.PAYMENT_ESCROW_ADDRESS;

  if (!parkingSpotAddress || !paymentEscrowAddress) {
    console.error("Please set PARKING_SPOT_ADDRESS and PAYMENT_ESCROW_ADDRESS environment variables");
    process.exit(1);
  }

  console.log("Verifying contracts...");

  // Verify ParkingSpot
  try {
    await hre.run("verify:verify", {
      address: parkingSpotAddress,
      constructorArguments: [],
    });
    console.log("ParkingSpot verified successfully!");
  } catch (error) {
    console.error("Error verifying ParkingSpot:", error.message);
  }

  // Verify PaymentEscrow
  try {
    await hre.run("verify:verify", {
      address: paymentEscrowAddress,
      constructorArguments: [],
    });
    console.log("PaymentEscrow verified successfully!");
  } catch (error) {
    console.error("Error verifying PaymentEscrow:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




