const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.ESCROW_ADDRESS;
  const cUSDToken = process.env.CUSD_TOKEN || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const cEURToken = process.env.CEUR_TOKEN || "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F";

  if (!contractAddress) {
    console.error("Please set ESCROW_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("Verifying PaymentEscrow contract...");
  
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [cUSDToken, cEURToken],
  });
  
  console.log("Contract verified successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




