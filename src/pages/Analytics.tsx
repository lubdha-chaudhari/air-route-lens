import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Analytics() {
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
            <div className="h-[300px] bg-gradient-to-br from-accent/30 to-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm">Line chart: AQI & Traffic Speed over time</p>
                <p className="text-xs mt-1">Chart.js integration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Congestion Impact on Fuel Wastage</CardTitle>
            <CardDescription>Daily average comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gradient-to-br from-accent/30 to-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm">Bar chart: Traffic vs Fuel Wastage</p>
                <p className="text-xs mt-1">Recharts integration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Hourly AQI Trend</CardTitle>
          <CardDescription>24-hour pollution pattern analysis for Delhi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] bg-gradient-to-br from-accent/30 to-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm">Area chart: Hourly AQI levels</p>
              <p className="text-xs mt-1">Shows peak pollution hours</p>
            </div>
          </div>
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
