# CarIn

Welcome to CarIn, a decentralized solution for finding and booking parking spots. This README provides the necessary details to get the project up and running on your local machine.

## Project Structure

- **/frontend**: Contains the Next.js application.
- **/smart-contracts**: Holds the Solidity smart contracts.

## Prerequisites

- **Node.js**: Version `18.17.0` or higher.
- **npm**: Version `9.0.0` or higher.

## Getting Started

To begin, clone the repository and install the required dependencies for both the frontend and smart contracts.

### Frontend Setup

Navigate to the `frontend` directory and run the following commands:

```bash
npm install
npm run dev
```

### Smart Contracts Setup

In the `smart-contracts` directory, set up your environment by creating a `.env` file with the required variables (e.g., `PRIVATE_KEY`, `MUMBAI_RPC_URL`). Then, run:

```bash
npm install
npx hardhat compile
```

## Available Scripts

### Frontend

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Runs the production build.
- `npm run lint`: Lints the codebase.

### Smart Contracts

- `npx hardhat test`: Executes the test suite.
- `npx hardhat deploy --network mumbai`: Deploys contracts to the Mumbai testnet.

By following these instructions, you'll have a fully functional local environment for both the frontend and smart contracts.