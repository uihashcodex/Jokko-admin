import { Card } from "antd";

const StatCard = ({ title, value }) => {
  return (
    <Card hoverable className="rounded-xl shadow-md">
      <h4 className="text-gray-500">{title}</h4>
      <h2 className="text-xl font-bold md:text-2xl">{value}</h2>
    </Card>
  );
};

export default StatCard;
