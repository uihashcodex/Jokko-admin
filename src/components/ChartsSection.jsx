import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";



const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function DashboardCharts({ dashboardData }) {


  const growthData = [
    { name: "Users", value: dashboardData?.totalUsers || 0 },
    { name: "Transactions", value: dashboardData?.totalTransactions || 0 },
    { name: "Networks", value: dashboardData?.totalNetworks || 0 },
  ];

  const pieData = [
    { name: "Individual", value: dashboardData?.individualCount || 0 },
    { name: "gas fee", value: dashboardData?.professionalCount || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
      
      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold mb-4 text-white">Growth Overview</h2>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={growthData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Distribution</h2>
        <ResponsiveContainer width="100%" height="89%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
