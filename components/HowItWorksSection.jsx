import React from "react";

const steps = [
  {
    number: "1",
    title: "Post Requirements",
    description:
      "Companies post their advertising needs with budget, timeline, and specifications.",
  },
  {
    number: "2",
    title: "Agencies Bid",
    description:
      "Qualified agencies show interest, attend explanation sessions, and submit their bids.",
  },
  {
    number: "3",
    title: "Perfect Match",
    description:
      "Companies select the best agency and collaborate to create amazing advertising campaigns.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-gray-50 py-20 px-4 md:px-10 lg:px-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">How AdMatchHub Works</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Simple, transparent, and effective process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-semibold shadow-md">
                {step.number}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
