"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "Is Ninco completely free to use?",
      answer: "Yes! Currently, the core features of Ninco are completely free. We believe everyone deserves access to high-quality financial tools."
    },
    {
      question: "How secure is my financial data?",
      answer: "We use modern security protocols to protect your data. Your information is never sold to third parties, and we rely on Clerk for secure, enterprise-grade authentication."
    },
    {
      question: "Can I use Ninco on my mobile device?",
      answer: "Absolutely. Ninco is designed as a website and app. You can install it directly to your home screen on iOS or Android for a native app experience."
    },
    {
      question: "How is Ninco different from using a spreadsheet?",
      answer: "Spreadsheets require manual effort to build charts, calculate running balances, and categorize transactions. Ninco automates all of this into a beautiful, dashboard interface that saves you time."
    },
    {
      question: "Can I manage multiple accounts?",
      answer: "Yes, you can create and track as many accounts (checking, savings, credit cards, cash) as you need to get a full picture of your net worth."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white dark:bg-stone-950 py-24">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="font-extrabold text-stone-900 dark:text-stone-50 text-3xl sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-stone-500 dark:text-stone-400 text-xl">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden"
            >
              <button
                className="flex justify-between items-center px-6 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-stone-900 dark:text-stone-50 text-lg">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 text-stone-600 dark:text-stone-400">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
