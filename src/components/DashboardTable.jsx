import { Card } from "antd";
import Tablecomp from "../reuseable/Table";

const DashboardTable = () => {
  const tableData = [
  {
    key: "1",
    firstName: "karthick",
    lastName: "Raja",
    age: 25,
    address: "Madurai",
    tags: ["react", "developer"],
  },
  {
    key: "2",
    firstName: "Vijay",
    lastName: "Kumar",
    age: 28,
    address: "Coiembatore",
    tags: ["node", "backend"],
  },
];
const userData = [
  {
    key: "1",
    firstName: "karthick",
    lastName: "Raja",
    age: 25,
    address: "Madurai",
    tags: ["react", "developer"],
  },
  {
    key: "2",
    firstName: "Vijay",
    lastName: "Kumar",
    age: 28,
    address: "Coiembatore",
    tags: ["node", "backend"],
  },
];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card title="Recent Users" className="mt-6">
      
      <Tablecomp data={tableData}/>
      
    </Card>
    <Card title="Anual Users" className="mt-6">
      <Tablecomp data={userData}/>
    </Card>
    </div>
  );
};

export default DashboardTable;
