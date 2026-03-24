import { Card } from "antd";

const StatCard = ({ title, value }) => {
  return (
    <Card hoverable className="rounded-xl shadow-md bg-[#5E5E5E33] border-gray-500 statcard" >
      <h4 className="text-gray-500">{title}</h4>
      <h2 className="text-xl font-bold md:text-2xl text-white">{value}</h2>
    </Card>
  );
};

export default StatCard;
