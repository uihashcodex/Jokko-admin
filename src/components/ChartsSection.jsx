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
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";
import { constant } from "../const";
import { CartesianGrid } from "recharts";


const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"];
export default function DashboardCharts({ dashboardData, showOnlyUserChart, showtransactionChart }) {



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


  const countryData =
    dashboardData?.countryChart?.map((item) => ({
      country: item.country,
      count: item.count
    })) || [];


  const pieData =
    dashboardData?.sourceChart?.map((item) => ({
      name: item.source,   // label
      value: item.users,   // value
    })) || [];


  const devicePieData =
    dashboardData?.deviceChart?.map((item) => ({
      name: item.device.toUpperCase(), // ANDROID / IOS
      value: item.users,
    })) || [];



  if (showOnlyUserChart) {
    return (
      <div className="mt-5 mb-5">
        <div className="dashboard-bg">
          <h2 className="text-lg font-semibold mb-4 text-white">
            User Details
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyUsers}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2e2a",
                  border: "1px solid #1f4d45",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#60a5fa" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />

              <Line
                type="monotone"
                dataKey="users_joined"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (showtransactionChart) {
    return (
      <div className="mt-5 mb-5">
        <div className="dashboard-bg">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Transactions Details
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrans}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2e2a",
                  border: "1px solid #1f4d45",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#60a5fa" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />


              <Line
                type="monotone"
                dataKey="user_Transactions"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }



  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
      
      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold mb-4 text-white">User Details</h2>

        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={weeklyUsers}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}

            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2e2a",
                  border: "1px solid #1f4d45",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#60a5fa" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />            <Line
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2e2a",
                  border: "1px solid #1f4d45",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#60a5fa" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />        
              
                  <Line
              type="monotone"
              dataKey="user_Transactions"
              stroke="#6366f1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

 

      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold text-white mb-4">Referal</h2>
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

        <div className="dashboard-bg">
          <h2 className="text-lg font-semibold text-white mb-4">
            Users by Device
          </h2>

          <ResponsiveContainer width="100%" height="89%">
            <PieChart>
              <Pie
                data={devicePieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {devicePieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>



      

    </div>



    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-7">
        <div className="dashboard-bg">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Users by Country
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              layout="vertical"
              data={countryData}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              {/* Count Axis */}
              <XAxis type="number" allowDecimals={false} />

              {/* Country Axis */}
              <YAxis
                type="category"
                dataKey="country"
                width={100}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2e2a",
                  border: "1px solid #1f4d45",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#60a5fa" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />

              <Bar
                dataKey="count"
                fill="#60a5fa"
                radius={[0, 6, 6, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
    </div>
    </>
  );
}
