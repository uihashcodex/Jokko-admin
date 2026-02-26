import { Card, Row, Col } from "antd";
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

  const userData = [...tableData];

  return (
    <>
      <style>
        {`
          .custom-card {
            background: #5E5E5E33 !important;
            color: white !important;
            border: none !important;
             margin-top:20px;
          }

          .custom-card .ant-card-head-title {
            color: white !important;
            font-weight: 600;
           
          }

          .custom-card .ant-card-body {
            padding: 16px;
          }
        `}
      </style>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent User"
            className="custom-card"
          >
            <Tablecomp data={tableData} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Anual Users"
            className="custom-card"
          >
            <Tablecomp data={userData} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardTable;