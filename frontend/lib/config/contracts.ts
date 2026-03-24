/**
 * Contract configuration and utilities
 */

export const NETWORKS = {
  alfajores: {
    name: "Alfajores Testnet",
    chainId: 44787,
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
  },
  celo: {
    name: "Celo Mainnet",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

export function getNetworkConfig(network: NetworkName = "alfajores") {
  return NETWORKS[network];
}

export function isNetworkSupported(chainId: number): boolean {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
}

export const DISPUTE_RESOLUTION_ADDRESSES = {
  alfajores: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS_ALFAJORES || "",
  celo: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS_CELO || "",
};

