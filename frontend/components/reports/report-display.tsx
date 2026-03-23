"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  BarChart3,
  Tag,
  Lightbulb,
  AlertTriangle,
  Brain,
  Calendar,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { GeneratedReport } from "@/lib/api/types";
import type { Easing } from "framer-motion";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface ReportDisplayProps {
  report: GeneratedReport;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as Easing },
  }),
};

export function ReportDisplay({ report }: ReportDisplayProps) {
  const { data, insights } = report;

  const savingsRate =
    data.totals.income > 0
      ? Math.round((data.totals.savings / data.totals.income) * 100)
      : 0;

  // Colors for pie chart
  const PIE_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#84cc16",
  ];

  return (
    <div className="space-y-8">
      {/* Period Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-muted-foreground text-sm"
      >
        <Calendar className="w-4 h-4" />
        <span>{report.periodLabel}</span>
        <span className="mx-2">•</span>
        <Activity className="w-4 h-4" />
        <span>{data.transactionCount} transactions</span>
        <span className="mx-2">•</span>
        <span>
          Generated {new Date(report.generatedAt).toLocaleDateString()}
        </span>
      </motion.div>

      {/* Summary Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-emerald-50 dark:bg-emerald-950/30 p-5 border border-emerald-200 dark:border-emerald-800 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">
              Total Income
            </span>
          </div>
          <p className="font-bold text-2xl text-emerald-800 dark:text-emerald-200">
            {formatCurrency(data.totals.income)}
          </p>
          <p className="mt-1 text-emerald-600 dark:text-emerald-400 text-xs">
            ~{formatCurrency(data.weeklyAverages.income)}/week
          </p>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-red-50 dark:bg-red-950/30 p-5 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-700 dark:text-red-300 text-sm">
              Total Expenses
            </span>
          </div>
          <p className="font-bold text-2xl text-red-800 dark:text-red-200">
            {formatCurrency(data.totals.expenses)}
          </p>
          <p className="mt-1 text-red-600 dark:text-red-400 text-xs">
            ~{formatCurrency(data.weeklyAverages.expenses)}/week
          </p>
        </motion.div>

        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-xl border p-5 ${
            data.totals.savings >= 0
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank
              className={`w-5 h-5 ${
                data.totals.savings >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                data.totals.savings >= 0
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-orange-700 dark:text-orange-300"
              }`}
            >
              Total Savings
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              data.totals.savings >= 0
                ? "text-blue-800 dark:text-blue-200"
                : "text-orange-800 dark:text-orange-200"
            }`}
          >
            {formatCurrency(data.totals.savings)}
          </p>
          <p
            className={`text-xs mt-1 ${
              data.totals.savings >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {savingsRate}% savings rate •{" "}
            ~{formatCurrency(data.weeklyAverages.savings)}/week
          </p>
        </motion.div>
      </div>

      {/* Weekly Breakdown Chart */}
      {data.weeklyBreakdown.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 border border-border rounded-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Weekly Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weeklyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                }}
                formatter={(value: unknown) => formatCurrency(Number(value))}
              />
              <Bar
                dataKey="income"
                fill="#10b981"
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="#ef4444"
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top Categories */}
      <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
        {/* Expense Categories */}
        {data.topCategories.expense.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card p-6 border border-border rounded-xl"
          >
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-lg">
              <BarChart3 className="w-5 h-5 text-red-500" />
              Top Expense Categories
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.topCategories.expense}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props: PieLabelRenderProps) =>
                    `${props.name || ''} (${((Number(props.percent) || 0) * 100).toFixed(1)}%)`
                  }
                >
                  {data.topCategories.expense.map((entry, index) => (
                    <Cell
                      key={entry.id}
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {data.topCategories.expense.slice(0, 5).map((cat) => (
                <div key={cat.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full w-3 h-3"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(cat.amount)} ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Income Categories */}
        {data.topCategories.income.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card p-6 border border-border rounded-xl"
          >
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-lg">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Top Income Categories
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.topCategories.income}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props: PieLabelRenderProps) =>
                    `${props.name || ''} (${((Number(props.percent) || 0) * 100).toFixed(1)}%)`
                  }
                >
                  {data.topCategories.income.map((entry, index) => (
                    <Cell
                      key={entry.id}
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {data.topCategories.income.slice(0, 5).map((cat) => (
                <div key={cat.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full w-3 h-3"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(cat.amount)} ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Top Tags */}
      {data.topTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card p-6 border border-border rounded-xl"
        >
          <h3 className="flex items-center gap-2 mb-4 font-semibold text-lg">
            <Tag className="w-5 h-5 text-purple-500" />
            Top Tags
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.topTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-purple-50 dark:bg-purple-950/30 px-4 py-2 border border-purple-200 dark:border-purple-800 rounded-lg"
              >
                <span className="font-medium text-purple-700 dark:text-purple-300 text-sm">
                  #{tag.name}
                </span>
                <p className="text-purple-500 dark:text-purple-400 text-xs">
                  {tag.count} transactions • {formatCurrency(tag.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">AI Insights</h3>
        </div>

        {/* AI Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="shrink-0 mt-0.5 w-4 h-4 text-amber-600 dark:text-amber-400" />
          <p className="text-amber-700 dark:text-amber-300 text-xs">
            This report is generated by AI. The tips and insights provided are
            based on your data patterns and should not be blindly trusted.
            Always use your own judgment when making financial decisions.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-linear-to-br from-primary/5 to-primary/10 p-5 border border-primary/20 rounded-xl">
          <p className="text-foreground text-sm leading-relaxed">
            {insights.summary}
          </p>
        </div>

        {/* Tips */}
        {insights.tips.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Tips to Improve
            </h4>
            <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
              {insights.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3 bg-card p-4 border border-border rounded-lg"
                >
                  <span className="flex shrink-0 justify-center items-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-6 h-6 font-bold text-xs text-yellow-700 dark:text-yellow-300">
                    {index + 1}
                  </span>
                  <p className="text-muted-foreground text-sm">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns */}
        {insights.patterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              Notable Patterns
            </h4>
            <div className="space-y-2">
              {insights.patterns.map((pattern, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-100 dark:border-blue-900 rounded-lg"
                >
                  <div className="bg-blue-200 dark:bg-blue-800 mt-1.5 rounded-full w-2 h-2 shrink-0" />
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {pattern}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
