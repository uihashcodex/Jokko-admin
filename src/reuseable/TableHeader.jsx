import { Row, Col, Input, Tooltip } from "antd";
import SelectField from "./SelectField";
import ReButton from "./Button";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Search } = Input;

const TableHeader = ({
  data = [],
  onFilter,
  onSearch, 
  onTypeChange,
  onVerifyChange,
  showStatusFilter = true,
  showPrivateFilter = false,
  showCreateButton = true,
  searchTooltip,
  onCreate,
  placeHolder
}) => {

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(undefined);
  const [privateType, setPrivateType] = useState(undefined);

// useEffect(() => {
//   let temp = [...data];

//   if (searchText) {
//     temp = temp.filter(item =>
//       Object.values(item)
//         .join(" ")
//         .toLowerCase()
//         .includes(searchText.toLowerCase())
//     );
//   }

//   if (status) {
//     temp = temp.filter(item => item.status === status);
//   }
//   if (privateType) {
//     temp = temp.filter(item => item.type === privateType);
//   }


//   onFilter && onFilter(temp);

// }, [searchText, status, privateType, data]);

  console.log(data, onFilter,"data1");

  return (
    <Row gutter={[16, 16]} justify="end" style={{ marginBottom: 16 }}>
      
      <Col xs={24} sm={12} md={8} lg={6}>
        <Tooltip title={searchTooltip} placement="top" color="rgb(18 47 42)">

        <Search
          placeholder={placeHolder || "Search..."}
          allowClear
          onChange={(e) => onSearch?.(e.target.value)}
          className="reusable-modal-search"
        />
        </Tooltip>
      </Col>

      {showStatusFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Status"
            value={status}
            className="custom-select reheader-modal"
            onChange={(value) => {
              setStatus(value);
              onVerifyChange?.(value);
            }}

            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" }
            ]}
          />
        </Col>
      )}

      {showPrivateFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Type"
            value={privateType}
            // onChange={setPrivateType}
            className="custom-select reheader-modal"
            onChange={(value) => onTypeChange?.(value)}

            options={[
              { label: "Individual", value: "individual" },
              { label: "Professional", value: "professional" }
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
