import { CheckCircle2, XCircle } from "lucide-react";

export function PainSection() {
  return (
    <section className="bg-stone-50 dark:bg-stone-900 py-24">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="font-extrabold text-stone-900 dark:text-stone-50 text-3xl sm:text-4xl">
            Tired of spreadsheets & bloated finance apps?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500 dark:text-stone-400 text-xl">
            Ninco cuts out the noise, so you can track your money without the headache.
          </p>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-3 lg:gap-8 mt-10 max-w-6xl mx-auto">
          {/* Spreadsheets Pain */}
          <div className="flex flex-col bg-stone-100/50 dark:bg-stone-800/20 p-8 border border-stone-200 dark:border-stone-800 rounded-3xl">
            <h3 className="mb-6 font-bold text-stone-900 dark:text-stone-300 text-xl">
              Spreadsheets
            </h3>
            <ul className="space-y-4">
              {[
                "Boring and manual",
                "Formulas break easily",
                "Hard to use on phone"
              ].map((item, i) => (
                <li key={i} className="flex flex-row items-center gap-3 text-stone-600 dark:text-stone-400 font-medium">
                  <XCircle className="w-5 h-5 text-stone-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Complex Apps Pain */}
          <div className="flex flex-col bg-stone-100/50 dark:bg-stone-800/20 p-8 border border-stone-200 dark:border-stone-800 rounded-3xl">
            <h3 className="mb-6 font-bold text-stone-900 dark:text-stone-300 text-xl">
              Complex Apps
            </h3>
            <ul className="space-y-4">
              {[
                "Cluttered & overwhelming",
                "Long, slow forms to fill",
                "Features you never use"
              ].map((item, i) => (
                <li key={i} className="flex flex-row items-center gap-3 text-stone-600 dark:text-stone-400 font-medium">
                  <XCircle className="w-5 h-5 text-stone-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ninco Solution */}
          <div className="flex flex-col bg-emerald-50 dark:bg-emerald-900/10 p-8 border border-emerald-200 dark:border-emerald-900/30 rounded-3xl relative shadow-xl shadow-emerald-500/5 md:-mt-4">
            <div className="absolute -top-4 -right-2 md:-right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-6">
              The sweet spot
            </div>
            <h3 className="mb-6 font-bold text-emerald-900 dark:text-emerald-400 text-2xl">
              Ninco
            </h3>
            <ul className="space-y-4">
              {[
                "Practical and simple",
                "Fast, AI-assisted entry",
                "Reliable, clear analysis"
              ].map((item, i) => (
                <li key={i} className="flex flex-row items-center gap-3 text-stone-800 dark:text-stone-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
