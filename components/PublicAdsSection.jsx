import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertisementAPI } from '../src/services/api';

export default function PublicAdsSection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await advertisementAPI.getPublic();
        setAds(res.data?.data || []);
      } catch (e) {
        setError(e?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBidNow = () => {
    navigate('/login');
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Live Client Products</h2>
            <p className="text-gray-600 mt-1">Discover campaigns from clients and start bidding.</p>
          </div>
          <button onClick={() => navigate('/register')} className="hidden sm:inline-flex bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Become an Agency
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl shadow p-6 h-56" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div key={ad._id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{ad.productName}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-3">{ad.productDescription}</p>
                  <div className="mt-3 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Budget</span>
                      <span>${ad.budget?.toLocaleString?.() || ad.budget || 'N/A'}</span>
                    </div>
                    {ad.category && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-medium">Category</span>
                        <span className="text-gray-600">{ad.category}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button onClick={() => navigate('/login')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Bid Now
                  </button>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Register
                  </button>
                </div>
              </div>
            ))}
            {ads.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No active campaigns yet. Check back soon.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


