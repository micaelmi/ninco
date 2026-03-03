"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface CategoryDistributionChartProps {
  title: string;
  description?: string;
  data: {
    id: string;
    name: string;
    value: number;
    color: string;
  }[];
  loading?: boolean;
  currencyCode?: string;
}

export function CategoryDistributionChart({ 
  title, 
  description, 
  data, 
  loading,
  currencyCode
}: CategoryDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card className="shadow-sm border-2 h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="bg-muted rounded-full w-32 h-32 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-2 h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex md:flex-row flex-col h-auto md:h-[300px]">
          {data.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-1 justify-center w-full h-[250px] md:h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value, currencyCode)}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        color: "var(--popover-foreground)",
                      }}
                      itemStyle={{ color: "var(--popover-foreground)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 md:mt-0 pt-4 md:pt-0 pr-1 md:pl-4 border-t md:border-t-0 md:border-l w-full md:w-[220px] lg:w-[260px] max-h-[250px] md:max-h-full overflow-y-auto shrink-0">
                <div className="flex flex-col gap-y-3 pt-2">
                  {data.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex justify-between items-center gap-2 w-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div 
                          className="rounded-full w-2.5 h-2.5 shrink-0" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className="max-w-[120px] text-muted-foreground text-xs truncate" title={entry.name}>
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pl-2 shrink-0">
                        <span className="font-medium text-xs">
                          {formatCurrency(entry.value, currencyCode)}
                        </span>
                        <span className="w-8 text-muted-foreground text-xs text-right shrink-0">
                          {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center w-full h-full text-muted-foreground text-sm italic">
              No data for this period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
