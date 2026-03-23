import { PieChart, TrendingUp, ShieldCheck, Wallet, ArrowRightLeft, Target } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "Track your money without the effort",
      description: "Log transactions in seconds. Categorize your spending automatically and see exactly where your money goes every month.",
      icon: <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: "Spot spending patterns easily",
      description: "Understand your money through beautiful, interactive charts. Spot trends before they become problems.",
      icon: <PieChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: "All your accounts, one clear picture",
      description: "Manage multiple bank accounts from a single, unified dashboard. Keep track of everything in one place.",
      icon: <ArrowRightLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    },
    // {
    //   title: "Smart Budget Goals",
    //   description: "Set realistic budget limits for different categories. Get alerted when you're close to overspending.",
    //   icon: <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    // },
    // {
    //   title: "Growth Projections",
    //   description: "Forecast your future wealth based on current savings rates and investment returns. Plan for the long term.",
    //   icon: <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    // },
    // {
    //   title: "Bank-Grade Security",
    //   description: "Your financial data is encrypted at rest and in transit. We prioritize your privacy and never sell your data.",
    //   icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    // }
  ];

  return (
    <section className="bg-white dark:bg-stone-950 py-24">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-semibold text-emerald-600 text-base uppercase tracking-wide">Features</h2>
          <p className="mt-2 font-extrabold text-stone-900 dark:text-stone-50 text-3xl sm:text-4xl leading-8 tracking-tight">
            See exactly where your money goes — automatically
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500 dark:text-stone-400 text-xl">
            Ninco replaces chaotic spreadsheets and bloated apps with simple, automated tools designed to keep you on budget.
          </p>
        </div>

        <div className="mt-10">
          <div className="gap-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col bg-stone-50 dark:bg-stone-900/50 hover:shadow-xl p-8 border border-stone-200 dark:border-stone-800 rounded-2xl transition-shadow duration-300">
                <div className="flex justify-center items-center bg-emerald-100 dark:bg-emerald-900/30 mb-6 rounded-xl w-12 h-12">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-bold text-stone-900 dark:text-stone-50 text-xl">{feature.title}</h3>
                <p className="flex-1 text-stone-600 dark:text-stone-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
