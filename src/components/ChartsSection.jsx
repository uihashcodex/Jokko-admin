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





  const [weeklyUsers, setWeeklyUsers] = useState([]);

  const [weeklyTrans, setWeeklyTrans] = useState([]);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDayName = (dateStr) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  useEffect(() => {
    getWeeklyUsers();
  }, []);

  const getWeeklyUsers = async () => {
    try {
      const res = await axios.get(`${constant.backend_url}/admin/weekly-users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const apiData = res.data.result.map((item) => ({
        day: getDayName(item[0]),
        count: item[1]
      }));

      const formatted = weekDays.map((day) => {
        const found = apiData.find((d) => d.day === day);
        return {
          date: day,
          count: found ? found.count : 0
        };
      });

      setWeeklyUsers(formatted);
      // const formatted = res.data.result.map((item) => ({
      //   date: getDayName(item[0]),   
      //   count: item[1]   
      // }));

      // setWeeklyUsers(formatted);

    } catch (err) {
      console.error(err);
    }
  };

  const getWeeklyTransactions = async () => {
    try {
      const res = await axios.get(`${constant.backend_url}/admin/weekly-transactions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const apiData = res.data.result.map((item) => ({
        day: getDayName(item[0]),
        count: item[1]
      }));

      const formatted = weekDays.map((day) => {
        const found = apiData.find((d) => d.day === day);
        return {
          date: day,
          count: found ? found.count : 0
        };
      });

      setWeeklyTrans(formatted);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getWeeklyTransactions();
  }, []);



  const transactionData = [
    ["Mon", 20],
    ["Tue", 35],
    ["Wed", 40],
    ["Thu", 28],
    ["Fri", 50],
    ["Sat", 45],
    ["Sun", 60]
  ];

  const transactionWeekData = transactionData.map(item => ({
    date: item[0],
    count: item[1]
  }));


  const pieData = [
    { name: "Platform fee", value: dashboardData?.individualCount || 0 },
    { name: "gas fee", value: dashboardData?.professionalCount || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
      
      <div className="dashboard-bg">
        <h2 className="text-lg font-semibold mb-4 text-white">User Details</h2>

        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={weeklyUsers}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}

            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
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
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
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
