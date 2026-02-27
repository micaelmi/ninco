"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OverviewChartProps {
  data: {
    period: string;
    income: number;
    expense: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <Tabs defaultValue="income" className="flex flex-col w-full h-full">
      <div className="flex justify-center mb-4">
        <TabsList>
          <TabsTrigger value="income" className="w-24">Income</TabsTrigger>
          <TabsTrigger value="expense" className="w-24">Expense</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="income" className="flex-1 mt-0 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="period"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "var(--popover-foreground)",
              }}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="income" name="Income" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="expense" className="flex-1 mt-0 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="period"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "var(--popover-foreground)",
              }}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="expense" name="Expense" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
}
