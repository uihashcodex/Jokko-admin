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

const growthData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 200 },
];

const pieData = [
  { name: "Sales", value: 400 },
  { name: "Marketing", value: 300 },
  { name: "Development", value: 300 },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
      
      <div className="bg-[#5E5E5E33] p-5 rounded-xl shadow-md h-[350px]">
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

      <div className="bg-[#5E5E5E33] p-5 rounded-xl shadow-md h-[350px]">
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
