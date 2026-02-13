"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
}

export function CategoryDistributionChart({ 
  title, 
  description, 
  data, 
  loading 
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
        <div className="h-[300px]">
          {data.length > 0 ? (
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
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    color: "var(--popover-foreground)",
                  }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-4 mt-4 max-h-[100px] overflow-y-auto">
                      {payload?.map((entry: any, index: number) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div 
                            className="rounded-full w-3 h-3" 
                            style={{ backgroundColor: entry.color }} 
                          />
                          <span className="text-muted-foreground text-xs">
                            {entry.value}: {Math.round((data[index].value / total) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-sm italic">
              No data for this period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
