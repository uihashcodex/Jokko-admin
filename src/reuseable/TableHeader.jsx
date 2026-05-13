import { Row, Col, Input, Tooltip, DatePicker, Grid } from "antd";
import SelectField from "./SelectField";
import ReButton from "./Button";
import ExportButton from "./ExportButton";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  CloseCircleFilled,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const DEFAULT_DATE_FIELDS = [
  "createdAt",
  "rawCreatedAt",
  "transactionDate",
  "DateTime",
  "date",
  "updatedAt",
  "created_at",
  "updated_at",
];

const parseDateValue = (value) => {
  if (!value || value === "-") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  const isoDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const localDateMatch = trimmedValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  if (localDateMatch) {
    const [, day, month, year] = localDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(trimmedValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const endOfDay = (date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
};

const TableHeader = ({
  data = [],
  getExportData,
  exportFilename,
  exportColumns,
  showExportButton = false,
  networkOptions = [],
  onFilter,
  onSearch,
  onTypeChange,
  onVerifyChange,
  onNetChange,
  onOnrampChange, // add this
  onNetworkChange,
  showStatusFilter = true,
  showPrivateFilter = false,
  showNetFilter = false,
  showNetworkFilter = false,
  showCreateButton = true,
  showseletButton = false,
  showDateFilter = false,
  showonrampFilter = false,
  showSearch = true,
  onDateChange,
  dateFieldNames = DEFAULT_DATE_FIELDS,
  dateFilterData,
  searchTooltip,
  onSelect,
  onCreate,
  placeHolder,
}) => {
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(undefined);
  const [privateType, setPrivateType] = useState(undefined);
  const [netType, setNetType] = useState(undefined);
  const [rampType, setRampType] = useState(undefined);
  const [networkType, setNetworkType] = useState(undefined);

  const { RangePicker } = DatePicker;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [dateRange, setDateRange] = useState([]);
  const [mobileStep, setMobileStep] = useState("start");
  const [mobileOpen, setMobileOpen] = useState(false);


  const dateBounds = useMemo(() => {
    const sourceData = Array.isArray(dateFilterData) ? dateFilterData : Array.isArray(data) ? data : [];
    const dates = sourceData
      .flatMap((item) => dateFieldNames.map((fieldName) => parseDateValue(item?.[fieldName])))
      .filter(Boolean)
      .map(startOfDay);

    const today = endOfDay(new Date());

    if (!dates.length) {
      return {
        minDate: null,
        maxDate: today,
        minPickerDate: undefined,
        maxPickerDate: dayjs(today),
      };
    }

    const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));

    return {
      minDate,
      maxDate: today,
      minPickerDate: dayjs(minDate),
      maxPickerDate: dayjs(today),
    };
  }, [data, dateFilterData, dateFieldNames]);

  const disabledDate = (current) => {
    if (!current) return false;

    const currentDate = current.toDate();
    const isBeforeAvailableData =
      dateBounds.minDate && currentDate < dateBounds.minDate;
    const isAfterToday = currentDate > dateBounds.maxDate;

    return isBeforeAvailableData || isAfterToday;
  };



  return (
    <Row gutter={[16, 16]} justify="end" style={{ marginBottom: 16, padding: "0 10px" }}>
      {showSearch && (
        <Col xs={24} sm={12} md={8} lg={6}>
          <Tooltip title={searchTooltip} placement="top" color="rgb(18 47 42)">
            <Search
              placeholder={placeHolder || "Search..."}
              allowClear
              value={searchText}
              onChange={(e) => {
                const value = e.target.value;
                setSearchText(value);
                onSearch?.(value);
              }}
              className="reusable-modal-search"
            />
          </Tooltip>
        </Col>
      )}

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
              { label: "Inactive", value: "inactive" },
            ]}
          />
        </Col>
      )}

      {showPrivateFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Type"
            value={privateType}
            className="custom-select reheader-modal"
            onChange={(value) => {
              setPrivateType(value);
              onTypeChange?.(value);
            }}
            options={[
              { label: "Individual", value: "individual" },
              { label: "Professional", value: "professional" },
            ]}
          />
        </Col>
      )}

      {showNetFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Mode Status"
            value={netType}
            className="custom-select reheader-modal"
            onChange={(value) => {
              setNetType(value);
              onNetChange?.(value);
            }}
            options={[
              { label: "MainNet", value: "Mainnet" },
              { label: "TestNet", value: "testnet" },
            ]}
          />
        </Col>
      )}

      {showonrampFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Provider Type"
            value={rampType}
            className="custom-select reheader-modal"
            onChange={(value) => {
              setRampType(value);
              onOnrampChange?.(value); // fixed here
            }}
            options={[
              { label: "TransFi", value: "transfi" },
              { label: "Fonbnk", value: "fonbnk" },
              { label: "OnRamper", value: "onramper" },
            ]}
          />
        </Col>
      )}

      {showNetworkFilter && (
        <Col xs={24} sm={12} md={6} lg={4}>
          <SelectField
            placeholder="Select Network Type"
            value={networkType}
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
                suffixIcon={dateRange?.length === 2 ? null : <CalendarOutlined />}
                disabledDate={disabledDate}
                minDate={dateBounds.minPickerDate}
                maxDate={dateBounds.maxPickerDate}
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
              disabledDate={disabledDate}
              minDate={dateBounds.minPickerDate}
              maxDate={dateBounds.maxPickerDate}
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

      {showExportButton && (
        <Col xs={24} sm={12} md={4} lg={4}>
          <ExportButton
            filename={exportFilename || "export"}
            columns={exportColumns || []}
            data={data || []}
            getExportData={getExportData}
          />
        </Col>
      )}
      {/* {showCreateButton && (
        <Col xs={24} sm={12} md={4} lg={4}>
          <Button
            icon={<PlusOutlined />}
            onClick={onclick}
            style={{
              background: "#c9f07b",
              borderColor: "#c9f07b",
              color: "#000",
              borderRadius: 6,
              height: 36,
              fontWeight: 700,
            }}
          >
            Create
          </Button>
        </Col>
      )} */}

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
