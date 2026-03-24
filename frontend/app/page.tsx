'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ViewToggle, { ViewMode } from '@/components/map/ViewToggle';
import SpotList from '@/components/map/SpotList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParkingSpots } from '@/lib/hooks/useParkingSpots';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { ParkingSpot } from '@/lib/hooks/useParkingSpots';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const { spots, loading } = useParkingSpots();
  const { location: userLocation } = useGeolocation();

  const handleSpotClick = (spot: ParkingSpot) => {
    window.location.href = `/booking/${spot.id}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Your Perfect Parking Spot
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Secure, transparent, and decentralized parking on the Celo blockchain. 
                Book instantly, pay with crypto, earn rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="#find-parking"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Find Parking Now
                </Link>
                <Link
                  href="/owner"
                  className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-blue-400"
                >
                  List Your Spot
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
                <p className="text-gray-600">
                  Smart contracts ensure secure payments and transparent transactions on the blockchain
                </p>
              </div>
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
                <p className="text-gray-600">
                  Real-time availability and instant confirmation. No waiting, no hassle
                </p>
              </div>
              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                <p className="text-gray-600">
                  Get rewarded for using and referring. Build your reputation and earn tokens
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="find-parking" className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Parking Spots</h2>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Loading...' : `${spots.length} spots available nearby`}
                </p>
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>

            {viewMode === 'map' ? (
              <div className="h-[calc(100vh-400px)] min-h-[500px] rounded-xl overflow-hidden shadow-lg">
                <MapView onSpotClick={handleSpotClick} />
              </div>
            ) : (
              <div>
                {loading ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading parking spots...</p>
                  </div>
                ) : (
                  <SpotList
                    spots={spots}
                    userLocation={userLocation}
                    onSpotClick={handleSpotClick}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}





