    import React from "react";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Ready to find your perfect advertising partner?
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Join thousands of companies and agencies already using <span className="font-medium text-purple-600">AdMatchHub</span> to create successful advertising campaigns.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition"
          >
            Get Started Today
          </a>
          <a
            href="#"
            className="px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
