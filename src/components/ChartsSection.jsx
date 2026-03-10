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
import axios from "axios";
import { useEffect, useState } from "react";
import { constant } from "../const";
import { CartesianGrid } from "recharts";


const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function DashboardCharts({ dashboardData }) {



  const formatDateMonth = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    return `${day} ${month}`; // 7 Mar
  };


  const weeklyUsers = dashboardData?.weeklyUsers?.map((item) => ({
    date: formatDateMonth(item[0]),
    users_joined: item[1]
  })) || [];

  const weeklyTrans = dashboardData?.weeklyTransactions?.map((item) => ({
    date: formatDateMonth(item[0]),
    user_Transactions: item[1]
  })) || [];



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
      
      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold mb-4 text-white">User Details</h2>

        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={weeklyUsers}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}

            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} domain={[0, "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users_joined"
              stroke="#6366f1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold mb-4 text-white">Transactions Details</h2>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={weeklyTrans}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} domain={[0, "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="user_Transactions"
              stroke="#6366f1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* <div className="dashboard-bg">
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
      </div> */}

    </div>
  );
}
