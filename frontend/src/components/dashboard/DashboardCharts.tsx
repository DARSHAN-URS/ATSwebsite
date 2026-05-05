import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  applied: "hsl(200, 80%, 52%)",
  screening: "hsl(38, 92%, 55%)",
  interview: "hsl(252, 68%, 55%)",
  offer: "hsl(152, 60%, 44%)",
  rejected: "hsl(0, 72%, 56%)",
};

interface DashboardChartsProps {
  statusBreakdown: { name: string; value: number }[];
  weeklyActivity: { week: string; count: number }[];
  applications: number;
  labels: {
    applicationStatus: string;
    statusBreakdown: string;
    weeklyActivity: string;
    weeklyActivityDesc: string;
    noAppsYet: string;
    noActivityYet: string;
  };
}

export default function DashboardCharts({ statusBreakdown, weeklyActivity, applications, labels }: DashboardChartsProps) {
  return (
    <>
      {/* Pie Chart */}
      <div>
        {statusBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPie>
              <Pie
                data={statusBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name.length > 8 ? name.slice(0, 8) + '…' : name} (${value})`}
              >
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(220, 10%, 50%)"} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">{labels.noAppsYet}</p>
        )}
      </div>

      {/* Bar Chart */}
      <div>
        {applications > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--foreground))" }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">{labels.noActivityYet}</p>
        )}
      </div>
    </>
  );
}
