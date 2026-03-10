import { Row, Col, Input, Tooltip, DatePicker,Grid } from "antd";
import SelectField from "./SelectField";
import ReButton from "./Button";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Search } = Input;

const TableHeader = ({
  data = [],
  networkOptions = [],
  onFilter,
  onSearch, 
  onTypeChange,
  onVerifyChange,
  onNetChange,
  onNetworkChange,
  showStatusFilter = true,
  showPrivateFilter = false,
  showNetFilter = false,
  showNetworkFilter=false,
  showCreateButton = true,
  showDateFilter = false,
  onDateChange,
  searchTooltip,
  onCreate,
  placeHolder
}) => {

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(undefined);
  const [privateType, setPrivateType] = useState(undefined);
  const [netType, setNetType] = useState(undefined);
  const [networkType, setNetworkType] = useState(undefined);
  const { RangePicker } = DatePicker;
  const [dateRange, setDateRange] = useState([]);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
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
    <Row gutter={[16, 16]} justify="end"  style={{ marginBottom: 16,padding:"0 10px" }}>
      
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

      {showNetFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Net Type"
            value={netType}
            // onChange={setPrivateType}
            className="custom-select reheader-modal"
            onChange={(value) => onNetChange?.(value)}

            options={[
              { label: "MainNet", value: "Mainnet" },
              { label: "TestNet", value: "testnet" }
            ]}
          />
        </Col>
      )}

      {showNetworkFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Network Type"
            value={networkType}
            // onChange={setPrivateType}
            className="custom-select reheader-modal"
            onChange={(value) => {
              setNetworkType(value);
              onNetworkChange?.(value);
            }}
            options={networkOptions}
          />
        </Col>
      )}
      {showDateFilter && (
        <Col xs={24} sm={12} md={8} lg={6}>
          <RangePicker
            value={dateRange}
            className="custom-select repicker-modal"
            popupClassName="custom-date-theme"
            style={{ width: "100%" }}
            picker="date"
            placement="bottomLeft"
            showTime={false}
            mode={screens.xs ? "date" : undefined}
            onChange={(dates, dateStrings) => {
              setDateRange(dates);
              onDateChange?.(dateStrings);
            }}
          />
        </Col>
      )}


      {showCreateButton && (
        <Col xs={24} sm={12} md={4} lg={2}>
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
