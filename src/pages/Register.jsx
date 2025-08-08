import React from 'react'

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to role selection
        </button>
        
        <div className="bg-white p-8 rounded-xl shadow-md">
          {selectedRole === 'client' ? (
            <ClientForm onSubmitSuccess={handleSubmitSuccess} />
          ) : (
            <AgencyForm onSubmitSuccess={handleSubmitSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

