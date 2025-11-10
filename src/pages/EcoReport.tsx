import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingDown, MapPin, Leaf } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

export default function EcoReport() {
  const topPollutedAreas = [
    { name: "Ring Road", aqi: 245, congestion: 82, emissions: 8.5 },
    { name: "MG Road", aqi: 182, congestion: 78, emissions: 6.2 },
    { name: "NH-8 Corridor", aqi: 210, congestion: 74, emissions: 7.8 },
    { name: "Airport Road", aqi: 165, congestion: 68, emissions: 5.4 },
    { name: "Cyber City", aqi: 158, congestion: 65, emissions: 5.1 },
  ];

  const sourceBreakdown = [
    { name: "Vehicles", value: 58 },
    { name: "Industry", value: 22 },
    { name: "Construction", value: 12 },
    { name: "Others", value: 8 },
  ];

  const pieConfig: ChartConfig = {
    Vehicles: { label: "Vehicles", color: "hsl(0 84% 60%)" },
    Industry: { label: "Industry", color: "hsl(221 83% 53%)" },
    Construction: { label: "Construction", color: "hsl(38 92% 50%)" },
    Others: { label: "Others", color: "hsl(142 72% 45%)" },
  };

  const monthlyAqi = [
    { month: "Jan", aqi: 162 },
    { month: "Feb", aqi: 155 },
    { month: "Mar", aqi: 172 },
    { month: "Apr", aqi: 165 },
    { month: "May", aqi: 178 },
    { month: "Jun", aqi: 160 },
    { month: "Jul", aqi: 148 },
    { month: "Aug", aqi: 150 },
    { month: "Sep", aqi: 170 },
    { month: "Oct", aqi: 190 },
    { month: "Nov", aqi: 210 },
    { month: "Dec", aqi: 185 },
  ];

  const monthlyConfig: ChartConfig = {
    aqi: { label: "Avg AQI", color: "hsl(280 72% 60%)" },
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Environmental Impact Report</h1>
          <p className="text-muted-foreground mt-1">City-wide pollution and traffic analysis</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total CO₂ Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 Tons</div>
            <p className="text-xs text-muted-foreground">Per day across all zones</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Wasted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,480 L</div>
            <p className="text-xs text-muted-foreground">Daily due to congestion</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Affected Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">Exposed to unhealthy air</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-success/30 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eco-Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">45/100</div>
            <p className="text-xs text-muted-foreground">Moderate environmental risk</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-destructive" />
            Top 5 Polluted Corridors
          </CardTitle>
          <CardDescription>Areas requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPollutedAreas.map((area, idx) => (
              <div key={idx} className="p-4 rounded-lg border-2 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                      <h3 className="font-semibold">{area.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-destructive">AQI {area.aqi}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Traffic Congestion</p>
                    <div className="flex items-center gap-2">
                      <Progress value={area.congestion} className="h-2" />
                      <span className="font-medium">{area.congestion}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Daily Emissions</p>
                    <p className="font-semibold">{area.emissions} tons CO₂</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Environmental Impact Breakdown</CardTitle>
            <CardDescription>Contribution by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieConfig} className="h-[300px]">
              <PieChart>
                <Pie data={sourceBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {sourceBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Monthly Trend Analysis</CardTitle>
            <CardDescription>Average AQI over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyConfig} className="h-[300px]">
              <AreaChart data={monthlyAqi}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Recommendations for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-card border-2">
              <h3 className="font-semibold mb-2">Traffic Management</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Implement odd-even vehicle rules during peak hours</li>
                <li>• Increase public transport frequency</li>
                <li>• Create dedicated green corridors</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-card border-2">
              <h3 className="font-semibold mb-2">Pollution Control</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Deploy air purification towers in hotspots</li>
                <li>• Enforce strict emission norms</li>
                <li>• Promote electric vehicle adoption</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-card border-2">
              <h3 className="font-semibold mb-2">Urban Planning</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Increase green cover by 15%</li>
                <li>• Implement pedestrian-friendly zones</li>
                <li>• Develop cycling infrastructure</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-card border-2">
              <h3 className="font-semibold mb-2">Citizen Awareness</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Launch air quality awareness campaigns</li>
                <li>• Provide real-time AQI alerts</li>
                <li>• Encourage carpooling and ride-sharing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
