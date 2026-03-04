import { Row, Col, Input } from "antd";
import SelectField from "./SelectField";
import ReButton from "./Button";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Search } = Input;

const TableHeader = ({
  data = [],
  onFilter,
  showStatusFilter = true,
  showCreateButton = true,
  onCreate,
}) => {

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(undefined);
useEffect(() => {
  let temp = [...data];

  if (searchText) {
    temp = temp.filter(item =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }

  if (status) {
    temp = temp.filter(item => item.status === status);
  }

  onFilter && onFilter(temp);

}, [searchText, status]);

  console.log(data, onFilter,"data1");

  return (
    <Row gutter={[16, 16]} justify="end" style={{ marginBottom: 16 }}>
      
      <Col xs={24} sm={12} md={8} lg={6}>
        <Search
          placeholder="Search..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          className="reusable-modal-search"
        />
      </Col>

      {showStatusFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Status"
            value={status}
            onChange={setStatus}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" }
            ]}
          />
        </Col>
      )}

      {showCreateButton && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <ReButton
            name="Create"
            type="primary"
            onClick={onCreate}
            icon={<PlusOutlined />}
          />
        </Col>
      )}
    </Row>
  );
};

export default TableHeader;
