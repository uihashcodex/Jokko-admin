import { Row, Col, Input, Tooltip, DatePicker,Grid } from "antd";
import SelectField from "./SelectField";
import ReButton from "./Button";
import { useState, useEffect } from "react";
import { CloseCircleFilled, CalendarOutlined, PlusOutlined, SwapRightOutlined } from "@ant-design/icons";

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
  showseletButton = false,
  showDateFilter = false,
  onDateChange,
  searchTooltip,
  onSelect,
  onCreate,
  placeHolder
}) => {

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(undefined);
  const [privateType, setPrivateType] = useState(undefined);
  const [netType, setNetType] = useState(undefined);
  const [networkType, setNetworkType] = useState(undefined);
  const { RangePicker } = DatePicker;
    const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [dateRange, setDateRange] = useState([]);
  const [mobileStep, setMobileStep] = useState("start");
  const [mobileOpen, setMobileOpen] = useState(false);
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
      {/* {showDateFilter && (
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
              const safeDates = dates ?? [];
              setDateRange(safeDates);
              onDateChange?.(dateStrings ?? []);
            }}
          />
        </Col>
      )} */}

      {showDateFilter && (
        <Col xs={24} sm={12} md={8} lg={6}>
          {screens.xs ? (
            <div style={{ position: "relative", width: "100%" }}>
              <DatePicker
                open={mobileOpen}
                allowClear={false}
                className="custom-select repicker-modal"
                popupClassName="custom-date-theme"
                style={{ width: "100%" }}
                placeholder="Select Date Range"
                value={dateRange?.[0] || null}
                inputReadOnly
                suffixIcon={dateRange?.length === 2 ? null : <CalendarOutlined />} format={() => {
                  if (dateRange?.[0] && dateRange?.[1]) {
                    return `${dateRange[0].format("YYYY-MM-DD")} "<CalendarOutlined />" ${dateRange[1].format(
                      "YYYY-MM-DD"
                    )}`;
                  }
                  if (dateRange?.[0]) {
                    return `${dateRange[0].format("YYYY-MM-DD")} - ...`;
                  }
                  return "";
                }}
                onOpenChange={(open) => setMobileOpen(open)}
                onChange={(date) => {
                  if (mobileStep === "start") {
                    setDateRange([date, null]);
                    setMobileStep("end");

                    setTimeout(() => {
                      setMobileOpen(true);
                    }, 200);
                  } else {
                    const range = [dateRange?.[0], date];
                    setDateRange(range);
                    setMobileStep("start");
                    setMobileOpen(false);

                    onDateChange?.([
                      range?.[0]?.format("YYYY-MM-DD"),
                      range?.[1]?.format("YYYY-MM-DD"),
                    ]);
                  }
                }}
              />

              {dateRange?.length === 2 && (
                <CloseCircleFilled
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDateRange([]);
                    setMobileStep("start");
                    onDateChange?.([]);
                  }}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#86c871",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                />
              )}
            </div>
          ) : (
            <RangePicker
              value={dateRange}
              className="custom-select repicker-modal"
              popupClassName="custom-date-theme"
              style={{ width: "100%" }}
              picker="date"
              placement="bottomLeft"
              showTime={false}
              onChange={(dates, dateStrings) => {
                setDateRange(dates);
                onDateChange?.(dateStrings);
              }}
            />
          )}
        </Col>
      )}


      {showCreateButton && (
        <Col xs={24} sm={12} md={4} lg={4}>
          <ReButton
            name="Create"
            type="primary"
            onClick={onCreate}
            icon={<PlusOutlined />}
          />
        </Col>
      )}
      {showseletButton && (
        <Col xs={24} sm={12} md={4} lg={4}>
          <ReButton
            name="Select Template"
            type="primary"
            onClick={onSelect}
            icon={<PlusOutlined />}
          />
        </Col>
      )}
    </Row>
  );
};

export default TableHeader;
