const hre = require("hardhat");

// Celo token addresses (Alfajores testnet)
const CELO_CUSD = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
const CELO_CEUR = "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F";

async function main() {
  console.log("Deploying PaymentEscrow contract...");

  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(CELO_CUSD, CELO_CEUR);
  
  await paymentEscrow.waitForDeployment();
  const address = await paymentEscrow.getAddress();
  
  console.log("PaymentEscrow deployed to:", address);
  console.log("cUSD Token:", CELO_CUSD);
  console.log("cEUR Token:", CELO_CEUR);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




