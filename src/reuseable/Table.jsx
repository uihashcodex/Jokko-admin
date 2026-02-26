import { useState } from "react";
import {
  Flex,
  Space,
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  // SearchOutlined,
} from "@ant-design/icons";
import InputField from '../reuseable/InputField';
import ReButton from "./Button";
import theme from '../config/theme';
const { Column, ColumnGroup } = Table;

const Tablecomp = ({ data }) => {
  const [tableData, setTableData] = useState(data);
  const [filteredData, setFilteredData] = useState(data);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const handleSearch = (value) => {
    setSearchText(value);

    const filtered = tableData.filter((item) =>
      item.firstName.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText("");
    setFilteredData(tableData);
  };

  const handleEdit = (record) => {
    setSelectedRow(record);
    form.setFieldsValue(record);
    setOpen(true);
  };


  const handleDelete = (key) => {
    const updated = tableData.filter((item) => item.key !== key);
    setTableData(updated);
    setFilteredData(updated);
    message.success("Deleted Successfully");
  };

  const onFinish = (values) => {
    const updated = tableData.map((item) =>
      item.key === selectedRow.key ? { ...item, ...values } : item
    );

    setTableData(updated);
    setFilteredData(updated);
    setOpen(false);
    message.success("Updated Successfully");
  };

  return (
    <>
    <style>
{`
  /* TABLE WRAPPER */
  .custom-table .ant-table {
    background: #5E5E5E33 !important;
    color: white !important;
    margin-top:10px !important;
  }

  .custom-table .ant-table-thead > tr > th {
    background: #5E5E5E33 !important;
    color: white !important;
  }

  .custom-table .ant-table-tbody > tr > td {
    background: #5E5E5E33 !important;
    color: white !important;
  }

  .custom-table .ant-table-tbody > tr:hover > td {
    background: rgba(94,94,94,0.3) !important;
  }

  /* SEARCH INPUT */
   /* Outer wrapper (IMPORTANT) */
  .custom-search .ant-input-affix-wrapper {
    background: #5E5E5E33 !important;
    border: 1px solid #5E5E5E33 !important;
    color: white !important;
    border:none !important;
  }

  /* Actual input */
  .custom-search .ant-input {
    background: transparent !important;
    color: white !important;
  }

  /* Placeholder */
  .custom-search .ant-input::placeholder {
    color: #ddd !important;
  }

  /* Prefix icon color */
  .custom-search .ant-input-prefix {
    color: white !important;
  }

  /* Remove blue focus glow */
  .custom-search .ant-input-affix-wrapper:focus,
  .custom-search .ant-input-affix-wrapper-focused {
    box-shadow: none !important;
    border-color: #5E5E5E33 !important;
  }

  /* RESET BUTTON */
  .custom-reset-btn {
    background: #5E5E5E33 !important;
    color: white !important;
    border: none !important;
  }

  .custom-reset-btn:hover {
    background: rgba(94,94,94,0.4) !important;
    color: white !important;
  }
`}
</style>
      <div className="flex! items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row justify-between ">
          {/* <Input
            placeholder="Search by First Name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-xs w-full sm:w-72 mb-4"
          /> 

          <Button onClick={handleReset} className="w-[100px] mt-4 mb-4">
            Reset
          </Button>*/}
          <InputField icon="SearchOutlined" style={{backgroundColor:"#5E5E5E33"}} className="custom-search w-full md:w-[50%]"
            placeholder="Search by First Name"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <ReButton name="Reset" className="custom-reset-btn mt-2 md:mt-0" onClick={handleReset} />
        </div>
        <Table
          className="custom-table"
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
          rowKey="key"
        >
          <ColumnGroup title="Name">
            <Column
              title="First Name"
              dataIndex="firstName"
              key="firstName"
              sorter={(a, b) => a.firstName.localeCompare(b.firstName)}
            />
            <Column
              title="Last Name"
              dataIndex="lastName"
              key="lastName"
            />
          </ColumnGroup>

          <Column
            title="Age"
            dataIndex="age"
            key="age"
            sorter={(a, b) => a.age - b.age}
            filters={[
              { text: "Below 30", value: "below30" },
              { text: "30 - 50", value: "30to50" },
              { text: "Above 50", value: "above50" },
            ]}
            onFilter={(value, record) => {
              if (value === "below30") return record.age < 30;
              if (value === "30to50")
                return record.age >= 30 && record.age <= 50;
              if (value === "above50") return record.age > 50;
            }}
          />

          <Column title="Address" dataIndex="address" key="address" />

          <Column
            title="Tags"
            dataIndex="tags"
            key="tags"
            render={(tags = []) => (
              <Flex gap="small" wrap>
                {tags.map((tag) => (
                  <Tag key={tag}>{tag.toUpperCase()}</Tag>
                ))}
              </Flex>
            )}
          />

          <Column
            title="Action"
            key="action"
            align="right"
            render={(_, record) => (
              <Space size="middle">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.key)}
                />
              </Space>
            )}
          />
        </Table>

        <Drawer
          title="Edit Details"
          open={open}
          onClose={() => setOpen(false)}
          style={{ width: window.innerWidth < 768 ? "100%" : 400 }}
        >

          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item name="firstName" label="First Name">
              <Input />
            </Form.Item>

            <Form.Item name="lastName" label="Last Name">
              <Input />
            </Form.Item>

            <Form.Item name="age" label="Age">
              <Input type="number" />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              Update
            </Button>
          </Form>
        </Drawer>
      </div>
    </>
  );
};

export default Tablecomp;
