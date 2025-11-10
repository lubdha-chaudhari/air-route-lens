import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

export default function Analytics() {
  // Hardcoded prototype data
  const weeklyTrend = [
    { day: "Mon", aqi: 150, speed: 34 },
    { day: "Tue", aqi: 162, speed: 32 },
    { day: "Wed", aqi: 170, speed: 28 },
    { day: "Thu", aqi: 180, speed: 26 },
    { day: "Fri", aqi: 192, speed: 24 },
    { day: "Sat", aqi: 140, speed: 36 },
    { day: "Sun", aqi: 132, speed: 38 },
  ];

  const congestionFuel = [
    { label: "Zone A", congestion: 65, fuel: 120 },
    { label: "Zone B", congestion: 72, fuel: 145 },
    { label: "Zone C", congestion: 58, fuel: 98 },
    { label: "Zone D", congestion: 80, fuel: 168 },
    { label: "Zone E", congestion: 69, fuel: 132 },
  ];

  const hourlyAqi = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}:00`,
    aqi: Math.round(120 + 80 * Math.sin((i / 24) * Math.PI * 2) + (i > 7 && i < 10 ? 40 : 0)),
  }));

  const correlationConfig: ChartConfig = {
    aqi: { label: "AQI", color: "hsl(0 84% 60%)" },
    speed: { label: "Avg Speed (km/h)", color: "hsl(221 83% 53%)" },
  };

  const barConfig: ChartConfig = {
    congestion: { label: "Congestion %", color: "hsl(38 92% 50%)" },
    fuel: { label: "Fuel Wasted (L)", color: "hsl(142 72% 45%)" },
  };

  const areaConfig: ChartConfig = {
    aqi: { label: "AQI", color: "hsl(280 72% 60%)" },
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">Historical data and correlation analysis</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="week">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="delhi">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Weekly AQI</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">168</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">+12%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traffic Index</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">+5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Emissions</CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8 tons</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">-8%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>AQI vs Traffic Speed Correlation</CardTitle>
            <CardDescription>Weekly trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={correlationConfig} className="h-[300px]">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="aqi" stroke="var(--color-aqi)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="speed" stroke="var(--color-speed)" strokeWidth={2} dot={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Congestion Impact on Fuel Wastage</CardTitle>
            <CardDescription>Daily average comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[300px]">
              <BarChart data={congestionFuel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="congestion" fill="var(--color-congestion)" radius={4} />
                <Bar dataKey="fuel" fill="var(--color-fuel)" radius={4} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Hourly AQI Trend</CardTitle>
          <CardDescription>24-hour pollution pattern analysis for Delhi</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={areaConfig} className="h-[250px]">
            <AreaChart data={hourlyAqi}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="var(--color-aqi)"
                fill="var(--color-aqi)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-card border-2">
              <p className="font-medium">Morning rush hour increases PM2.5 by 25%</p>
              <p className="text-sm text-muted-foreground mt-1">Peak pollution occurs between 8-10 AM on weekdays</p>
            </div>
            <div className="p-4 rounded-lg bg-card border-2">
              <p className="font-medium">Traffic congestion strongly correlates with AQI levels</p>
              <p className="text-sm text-muted-foreground mt-1">Areas with 70%+ congestion show 40% higher AQI on average</p>
            </div>
            <div className="p-4 rounded-lg bg-card border-2">
              <p className="font-medium">Weekend air quality improves by 18%</p>
              <p className="text-sm text-muted-foreground mt-1">Reduced commercial traffic leads to lower pollution levels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
