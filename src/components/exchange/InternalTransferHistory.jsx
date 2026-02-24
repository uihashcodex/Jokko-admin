import { useState } from 'react'
import { Input, Select } from "antd";
import ReusableTable from '../../reuseable/ReusableTable';

const { Option } = Select;

const InternalTransferHistory = () => {

    const originalData = [
        {
            id: 1,
            sno: 1,
            username: "Ramesh Kumar",
            fromtype: "SPOT",
            totype: "FUNDING",
            amount: "1 APZ",
            date: "17/09/2025 13:02",
        },
        {
            id: 2,
            sno: 2,
            username: "Suhail Govender",
            fromtype: "FUNDING",
            totype: "SPOT",
            amount: "316.00355831650506 ZAR",
            date: "03/09/2025 14:58",
        }
    ];

    const [filteredData, setFilteredData] = useState(originalData);
    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "User Name", dataIndex: "username", key: "username" },
        { title: "From Type", dataIndex: "fromtype", key: "fromtype" },
        { title: "To Type", dataIndex: "totype", key: "totype" },
        { title: "Amount", dataIndex: "amount", key: "amount" },
        { title: "Date", dataIndex: "date", key: "date" }
    ];

    const applyFilters = (search, type) => {
        let data = [...originalData];

        if (search) {
            data = data.filter(item =>
                item.username.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (type !== "ALL") {
            data = data.filter(item =>
                item.fromtype === type 
            );
        }

        setFilteredData(data);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        applyFilters(value, typeFilter);
    };

    const handleTypeChange = (value) => {
        setTypeFilter(value);
        applyFilters(searchText, value);
    };

    return (
        <div>
           <h1 className='text-sm md:text-2xl  font-semibold'> Convert History List</h1>
            <div className="flex flex-col justify-center md:justify-end md:flex-row gap-3 mb-4 mt-3">
                
                <Input
                    placeholder="Search User Name"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full md:w-60"
                    allowClear
                />

                <Select
                    value={typeFilter}
                    onChange={handleTypeChange}
                    className="w-full md:w-48"
                >
                    <Option value="ALL">ALL</Option>
                    <Option value="FUNDING">FUNDING</Option>
                    <Option value="SPOT">SPOT</Option>
                    <Option value="MARGIN">MARGIN</Option>
                    <Option value="FUTURE">FUTURE</Option>
                </Select>

            </div>

            {/* 🔥 TABLE BELOW */}
            <ReusableTable
                columns={columns}
                data={filteredData}
                actionType={null}
            />

        </div>
    )
}

export default InternalTransferHistory;