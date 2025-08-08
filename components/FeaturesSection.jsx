import {
  FaBriefcase,
  FaHandshake,
  FaDollarSign,
  FaShieldAlt,
  FaBolt,
  FaChartLine,
} from "react-icons/fa";
import React from "react";

const features = [
  {
    icon: <FaBriefcase className="text-purple-600 text-3xl" />,
    title: "Post Ad Requirements",
    desc: "Companies can easily post their advertising needs with detailed specifications and budget ranges.",
  },
  {
    icon: <FaHandshake className="text-purple-600 text-3xl" />,
    title: "Connect with Agencies",
    desc: "Agencies can browse projects, show interest, and participate in explanation sessions.",
  },
  {
    icon: <FaDollarSign className="text-purple-600 text-3xl" />,
    title: "Transparent Bidding",
    desc: "Fair bidding system with edit windows and clear selection criteria.",
  },
  {
    icon: <FaShieldAlt className="text-purple-600 text-3xl" />,
    title: "Secure Payments",
    desc: "Protected commission system with escrow and automated payment processing.",
  },
  {
    icon: <FaBolt className="text-purple-600 text-3xl" />,
    title: "Real-time Updates",
    desc: "Live notifications for project updates, meetings, and bid results.",
  },
  {
    icon: <FaChartLine className="text-purple-600 text-3xl" />,
    title: "Performance Tracking",
    desc: "Comprehensive analytics for both clients and agencies to track success.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-gray-50 py-20 px-4 md:px-10 lg:px-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Everything you need to succeed
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Our platform provides all the tools and features needed for successful advertising partnerships.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="mb-4">{feature.icon}</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
