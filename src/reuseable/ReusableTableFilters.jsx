import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

const ReusableTableFilters = ({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-start md:justify-end ${className}`}
    >
      {/* Search */}
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full md:w-60"
        allowClear
      />

      {/* Sort */}
      <Select
        value={sortValue}
        onChange={onSortChange}
        className="w-full md:w-40"
      >
        <Option value="newest">Newest</Option>
        <Option value="oldest">Oldest</Option>
      </Select>
    </div>
  );
};

export default ReusableTableFilters;