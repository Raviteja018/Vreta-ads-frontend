// components/StatsSection.jsx
import React from 'react';
import { FaBriefcase, FaUsers, FaCheckCircle, FaDollarSign } from 'react-icons/fa';

const stats = [
  {
    icon: <FaBriefcase className="text-3xl text-purple-600" />,
    value: '250+',
    label: 'Active Projects',
  },
  {
    icon: <FaUsers className="text-3xl text-purple-600" />,
    value: '500+',
    label: 'Registered Agencies',
  },
  {
    icon: <FaCheckCircle className="text-3xl text-purple-600" />,
    value: '1,200+',
    label: 'Successful Matches',
  },
  {
    icon: <FaDollarSign className="text-3xl text-purple-600" />,
    value: '$2.5M+',
    label: 'Total Volume',
  },
];

export default function StatsSection() {
  return (
    <section className="bg-gray-50 py-12 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition"
          >
            <div className="mb-3 flex justify-center">{stat.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
