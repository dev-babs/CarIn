import { ethers } from "ethers";
import { getParkingSpotContract } from "./parkingSpot";
import { getPaymentEscrowContract } from "./paymentEscrow";

/**
 * Booking integration functions connecting ParkingSpot and PaymentEscrow contracts
 */

export interface BookingRequest {
  spotId: number;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  amount: string; // Amount in wei or token units
  token: string; // Token address (address(0) for native CELO)
}

export interface BookingResult {
  bookingId: number;
  escrowId: number;
  transactionHash: string;
}

/**
 * Create a booking with escrow payment
 */
export async function createBookingWithEscrow(
  provider: ethers.Provider | ethers.Signer,
  bookingRequest: BookingRequest,
  network: "alfajores" | "celo" = "alfajores"
): Promise<BookingResult> {
  const parkingSpot = getParkingSpotContract(provider, network);
  const paymentEscrow = getPaymentEscrowContract(provider, network);

  // 1. Create booking on ParkingSpot contract
  const bookingTx = await parkingSpot.createBooking(
    bookingRequest.spotId,
    bookingRequest.startTime,
    bookingRequest.endTime
  );
  const bookingReceipt = await bookingTx.wait();
  
  // Extract booking ID from event
  const bookingId = bookingReceipt.logs[0]?.args?.[0]?.toNumber() || 0;

  // 2. Create escrow on PaymentEscrow contract
  const releaseTime = bookingRequest.endTime;
  const expirationTime = bookingRequest.endTime + (30 * 24 * 60 * 60); // 30 days

  let escrowTx;
  if (bookingRequest.token === ethers.ZeroAddress) {
    // Native CELO
    escrowTx = await paymentEscrow.createEscrow(
      bookingId,
      await parkingSpot.getSpot(bookingRequest.spotId).then((spot: any) => spot.owner),
      releaseTime,
      expirationTime,
      { value: bookingRequest.amount }
    );
  } else {
    // ERC20 token
    escrowTx = await paymentEscrow.createEscrowERC20(
      bookingId,
      await parkingSpot.getSpot(bookingRequest.spotId).then((spot: any) => spot.owner),
      bookingRequest.token,
      bookingRequest.amount,
      releaseTime,
      expirationTime
    );
  }

  const escrowReceipt = await escrowTx.wait();
  const escrowId = escrowReceipt.logs[0]?.args?.[0]?.toNumber() || 0;

  return {
    bookingId,
    escrowId,
    transactionHash: bookingTx.hash,
  };
}

/**
 * Get user's bookings from smart contract
 */
export async function getUserBookings(
  provider: ethers.Provider,
  userAddress: string,
  network: "alfajores" | "celo" = "alfajores"
): Promise<any[]> {
  const parkingSpot = getParkingSpotContract(provider, network);
  
  // TODO: Fetch bookings from contract
  // const bookingIds = await parkingSpot.getUserBookings(userAddress);
  // const bookings = await Promise.all(bookingIds.map(id => parkingSpot.getBooking(id)));
  
  return [];
}




