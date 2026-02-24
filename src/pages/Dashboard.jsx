import StatCard from "../components/StatCard";
import ChartsSection from "../components/ChartsSection";
import DashboardTable from "../components/DashboardTable";
import theme from '../config/theme';
const Dashboard = () => {
  return (
    <div className="">
      {/* <div className="bg-img mb-5 w-full rounded-lg">
        <h1 className="text-white text-start p-7 font-bold text-2xl">DashBoard</h1>
      </div> */}
      <div
        className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url(${theme.dashboardheaderimg.image})`,
          height: theme.dashboardheaderimg.height
        }}
      >
        <h1 className="text-white p-7 font-bold text-2xl">
          DashBoard
        </h1>
      </div>
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Users" value="1,245" />
        <StatCard title="Orders" value="856" />
        <StatCard title="Revenue" value="$12,450" />
        <StatCard title="Visitors" value="5,678" />
        <StatCard title="Products" value="320" />
        <StatCard title="Sales" value="$8,900" />
      </div>

      <ChartsSection />

      <DashboardTable />
    </div>
  );
};

export default Dashboard;
