'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';

const Header = () => {
  const { address, isConnected } = useAccount();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl px-3 py-1 rounded-lg">
                CarIn
              </div>
              <span className="hidden sm:block text-sm text-gray-600">
                Decentralized Parking
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Find Parking
            </Link>
            <Link
              href="/owner"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              List Your Spot
            </Link>
            <Link
              href="/bookings"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              My Bookings
            </Link>
            <Link
              href="/rewards"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Rewards
            </Link>
            <Link
              href="/disputes"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Disputes
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && address && (
              <div className="hidden sm:block text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
            )}
            <appkit-button />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
