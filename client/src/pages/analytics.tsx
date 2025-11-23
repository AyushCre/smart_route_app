import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { useState } from "react";

const deliveryTrendsData = [
  { date: "Mon", deliveries: 45, completed: 42, delayed: 3 },
  { date: "Tue", deliveries: 52, completed: 48, delayed: 4 },
  { date: "Wed", deliveries: 38, completed: 36, delayed: 2 },
  { date: "Thu", deliveries: 61, completed: 57, delayed: 4 },
  { date: "Fri", deliveries: 58, completed: 55, delayed: 3 },
  { date: "Sat", deliveries: 42, completed: 40, delayed: 2 },
  { date: "Sun", deliveries: 35, completed: 34, delayed: 1 },
];

const costAnalysisData = [
  { route: "Route A", fuel: 245, labor: 380, maintenance: 120 },
  { route: "Route B", fuel: 198, labor: 340, maintenance: 95 },
  { route: "Route C", fuel: 312, labor: 420, maintenance: 140 },
  { route: "Route D", fuel: 275, labor: 360, maintenance: 110 },
  { route: "Route E", fuel: 189, labor: 320, maintenance: 85 },
];

const deliveryStatusData = [
  { name: "Delivered", value: 342, color: "#16a34a" },
  { name: "In Transit", value: 58, color: "#2563eb" },
  { name: "Pending", value: 23, color: "#eab308" },
  { name: "Delayed", value: 12, color: "#dc2626" },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="space-y-6" data-testid="page-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Insights and performance metrics for your operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-data" onClick={() => {
            const csv = "Analytics Export\nTime Range: " + timeRange + "\nGenerated: " + new Date().toISOString();
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics-${Date.now()}.csv`;
            a.click();
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Delivery Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliveryTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="deliveries"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Total Deliveries"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="delayed"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="Delayed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Delivery Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Cost Analysis by Route</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="route"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar dataKey="fuel" fill="hsl(var(--chart-1))" name="Fuel Cost" />
                <Bar dataKey="labor" fill="hsl(var(--chart-2))" name="Labor Cost" />
                <Bar dataKey="maintenance" fill="hsl(var(--chart-4))" name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Top Performing Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costAnalysisData.map((route, index) => {
              const totalCost = route.fuel + route.labor + route.maintenance;
              const efficiency = Math.round((1 - totalCost / 1000) * 100);

              return (
                <div
                  key={route.route}
                  className="flex items-center gap-4 rounded-md border p-4 hover-elevate"
                  data-testid={`route-performance-${index}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{route.route}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Cost: ${totalCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-mono text-sm font-medium">{efficiency}% efficient</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
