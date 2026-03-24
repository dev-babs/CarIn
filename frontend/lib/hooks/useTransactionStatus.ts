import { useState, useEffect, useCallback } from "react";

export type TransactionStatus = "idle" | "preparing" | "confirming" | "confirmed" | "failed";

interface UseTransactionStatusReturn {
  status: TransactionStatus;
  transactionHash: string | null;
  error: string | null;
  startTransaction: (txHash: string) => void;
  confirmTransaction: () => void;
  failTransaction: (error: string) => void;
  reset: () => void;
}

export function useTransactionStatus(): UseTransactionStatusReturn {
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTransaction = useCallback((txHash: string) => {
    setTransactionHash(txHash);
    setStatus("confirming");
    setError(null);
  }, []);

  const confirmTransaction = useCallback(() => {
    setStatus("confirmed");
    setError(null);
  }, []);

  const failTransaction = useCallback((errorMessage: string) => {
    setStatus("failed");
    setError(errorMessage);
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTransactionHash(null);
    setError(null);
  }, []);

  return {
    status,
    transactionHash,
    error,
    startTransaction,
    confirmTransaction,
    failTransaction,
    reset,
  };
}




