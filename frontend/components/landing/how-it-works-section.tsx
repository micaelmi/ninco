import { UserPlus, ArrowRight, LineChart } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      title: "Sign up in 30 seconds",
      description: "No credit card required, completely free to start tracking your finances.",
      icon: <UserPlus className="w-8 h-8 text-emerald-600" />
    },
    {
      title: "Add expenses in seconds",
      description: "Log your income and expenses using our lightning-fast, intuitive entry forms designed for mobile and desktop.",
      icon: <ArrowRight className="w-8 h-8 text-emerald-600" />
    },
    {
      title: "Instantly see your money",
      description: "Watch as our automated charts show you exactly where your money is going, without lifting a finger.",
      icon: <LineChart className="w-8 h-8 text-emerald-600" />
    }
  ];

  return (
    <section className="bg-stone-50 dark:bg-stone-900 py-24">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="font-extrabold text-stone-900 dark:text-stone-50 text-3xl sm:text-4xl">
            From zero to clarity in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500 dark:text-stone-400 text-xl">
            Three simple steps to finally take control.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block top-12 right-[10%] left-[10%] absolute bg-emerald-200 dark:bg-emerald-900/50 h-0.5" />
          
          <div className="z-10 relative gap-12 grid grid-cols-1 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="group flex flex-col items-center text-center">
                <div className="z-10 flex justify-center items-center bg-white dark:bg-stone-950 shadow-lg mb-6 border-4 border-emerald-100 dark:border-emerald-900/30 group-hover:border-emerald-500 rounded-full w-24 h-24 transition-colors">
                  {step.icon}
                </div>
                <div className="bg-white dark:bg-stone-800/50 shadow-sm p-6 border border-stone-100 dark:border-stone-800 rounded-2xl w-full h-full">
                  <h3 className="flex justify-center items-center mb-4 font-bold text-stone-900 dark:text-stone-50 text-xl">
                    <span className="flex justify-center items-center bg-emerald-100 dark:bg-emerald-900/50 mr-2 rounded-full w-8 h-8 text-emerald-700 dark:text-emerald-400 text-sm">
                      {index + 1}
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
