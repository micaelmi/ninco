"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "Is this better than Excel?",
      answer: "Yes. Spreadsheets require manual effort to build charts, calculate running balances, and categorize transactions. Ninco automates all of this into a beautiful dashboard that saves you time."
    },
    {
      question: "How long does setup take?",
      answer: "Less than 2 minutes. There is no complex onboarding or tutorials to read. Just sign up and start adding your expenses immediately."
    },
    {
      question: "Do I need to connect my bank?",
      answer: "No! Ninco tracks what you input by design. You don't have to link any bank accounts, which means you don't face syncing issues and your bank login remains 100% private."
    },
    {
      question: "Can I use it daily?",
      answer: "Absolutely. Ninco is built for speed. Adding an expense takes two seconds, making it perfect for quick, daily tracking directly on your phone or desktop."
    },
    {
      question: "Is it really free?",
      answer: "Yes! The core tracking and dashboard features of Ninco are completely free. No credit card required. Some advanced features like AI insights are only available for premium users."
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
                  className={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
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
