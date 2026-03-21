"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getReportData } from "@/lib/api/reports";
import { generateReportInsights } from "@/lib/ai/generate-report";
import { useConsumeAiCredit, useAiCredits } from "@/lib/hooks/use-ai-credits";
import { ReportDisplay } from "./report-display";
import type { GeneratedReport } from "@/lib/api/types";
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
} from "date-fns";

interface ReportsClientProps {
  userName: string;
}

type PeriodOption = {
  label: string;
  value: string;
  from: Date;
  to: Date;
};

function buildPeriodOptions(): PeriodOption[] {
  const now = new Date();
  const options: PeriodOption[] = [];

  // Current month
  options.push({
    label: format(now, "MMMM yyyy"),
    value: "current",
    from: startOfMonth(now),
    to: endOfMonth(now),
  });

  // Past 11 months
  for (let i = 1; i <= 11; i++) {
    const month = subMonths(now, i);
    options.push({
      label: format(month, "MMMM yyyy"),
      value: `month-${i}`,
      from: startOfMonth(month),
      to: endOfMonth(month),
    });
  }

  // All time (2 years ago to now)
  const twoYearsAgo = subMonths(now, 24);
  options.push({
    label: "All Time",
    value: "all-time",
    from: twoYearsAgo,
    to: endOfMonth(now),
  });

  return options;
}

const AI_CREDITS_PER_REPORT = 8;

export function ReportsClient({ userName }: ReportsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ninco-latest-report");
    if (saved) {
      try {
        setReport(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse saved report:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (report) {
      localStorage.setItem("ninco-latest-report", JSON.stringify(report));
    }
  }, [report]);

  const periodOptions = buildPeriodOptions();
  const selectedOption = periodOptions.find((o) => o.value === selectedPeriod)!;

  const { data: credits } = useAiCredits();
  const consumeCredit = useConsumeAiCredit();

  const hasEnoughCredits = credits ? credits.remaining >= AI_CREDITS_PER_REPORT : false;

  async function handleGenerate() {
    if (!hasEnoughCredits) {
      toast.error(
        `You need ${AI_CREDITS_PER_REPORT} AI credits to generate a report. You have ${credits?.remaining || 0} remaining.`
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Step 1: Consume AI credits (8 credits)
      for (let i = 0; i < AI_CREDITS_PER_REPORT; i++) {
        await consumeCredit.mutateAsync();
      }

      // Step 2: Fetch report data from backend
      const data = await getReportData({
        from: selectedOption.from.toISOString(),
        to: selectedOption.to.toISOString(),
      });

      if (data.transactionCount === 0) {
        setReport({
          data,
          insights: {
            summary:
              "No transactions found for this period. Add some transactions to get personalized insights!",
            tips: [
              "Start tracking your expenses daily to build a clear picture of your spending habits.",
              "Set up recurring income entries to keep your records up to date.",
              "Use categories and tags to organize your transactions for better analysis.",
            ],
            patterns: [],
          },
          generatedAt: new Date().toISOString(),
          periodLabel: selectedOption.label,
        });
        setIsGenerating(false);
        return;
      }

      // Step 3: Generate AI insights
      const insights = await generateReportInsights(data);

      setReport({
        data,
        insights,
        generatedAt: new Date().toISOString(),
        periodLabel: selectedOption.label,
      });

      toast.success("Report generated successfully!");
    } catch (err) {
      console.error("Report generation failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadPDF() {
    if (!reportRef.current) return;

    try {
      toast.info("Generating PDF...");

      const { toPng } = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;

      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2,
      });

      const width = reportRef.current.offsetWidth;
      const height = reportRef.current.offsetHeight;

      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save(
        `ninco-report-${selectedOption.label.replace(/\s+/g, "-").toLowerCase()}.pdf`
      );

      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    }
  }

  async function handleDownloadImage() {
    if (!reportRef.current) return;

    try {
      toast.info("Generating image...");

      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `ninco-report-${selectedOption.label.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Image downloaded!");
    } catch (err) {
      console.error("Image generation failed:", err);
      toast.error("Failed to generate image");
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Financial Reports
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Generate AI-powered insights about your finances, {userName}.
        </p>
      </div>

      {/* Controls */}
      <div className="flex sm:flex-row flex-col gap-4">
        {/* Period Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-card hover:bg-accent px-4 py-2.5 border border-border rounded-lg min-w-[200px] text-left text-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1">{selectedOption.label}</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="z-50 absolute mt-1 bg-card py-1 border border-border rounded-lg shadow-lg w-full max-h-64 overflow-y-auto"
              >
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-accent ${
                      selectedPeriod === option.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !hasEnoughCredits}
          className="gap-2 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white cursor-pointer"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Report
            </>
          )}
        </Button>

        {/* Credits Info */}
        {credits && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs self-center">
            <span>
              {credits.remaining}/{credits.limit} AI credits
            </span>
            <span>•</span>
            <span>{AI_CREDITS_PER_REPORT} credits per report</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 px-4 py-3 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card p-5 border border-border rounded-xl h-28 animate-pulse"
                >
                  <div className="bg-muted rounded w-24 h-4" />
                  <div className="bg-muted mt-4 rounded w-32 h-6" />
                </div>
              ))}
            </div>
            <div className="bg-card p-6 border border-border rounded-xl h-72 animate-pulse">
              <div className="bg-muted rounded w-48 h-4" />
            </div>
            <div className="flex justify-center items-center gap-3 py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm">
                Analyzing your financial data and generating insights...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Display */}
      {report && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Download Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImage}
              className="gap-2 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Download Image
            </Button>
          </div>

          <div ref={reportRef} className="bg-background p-6 -mx-6 sm:p-8 sm:-mx-8 rounded-2xl">
            <ReportDisplay report={report} />
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!report && !isGenerating && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">No Report Generated Yet</h2>
            <p className="mt-1 max-w-md text-muted-foreground text-sm">
              Select a time period and click &quot;Generate Report&quot; to get
              AI-powered insights about your finances.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
