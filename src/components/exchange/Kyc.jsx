import { useState } from 'react'
import ReusableTable from '../../reuseable/ReusableTable';
import ReusableTabs from '../../reuseable/ReusableTabs';
import ReusableTableFilters from '../../reuseable/ReusableTableFilters';
const Kyc = () => {
    const [activeTab, setActiveTab] = useState("all");
    const tabItems = [
        {
            key: "all",
            label: "All",
        },
        {
            key: "pending",
            label: "Pending",
        },
    ];
    const [originalData, setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            firstname: "john",
            email: "john@gmail.com",
            postalcode: "4093",
            city: "Chartsworth",
            stateorprovince: "KwaZulu-Natal",
            status: "pending",
        },
        {
            id: 2,
            sno: 2,
            firstname: "Suhail Govender",
            email: "suhailgovender1@gmail.com",
            postalcode: "4068",
            city: "Phoenix",
            stateorprovince: "Kwazulu-Natal",
            status: "approved",
        }
    ]);
    const [filteredData, setFiteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "First Name", dataIndex: "firstname", key: "firstname" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Postal Code", dataIndex: "postalcode", key: "postalcode" },
        { title: "City", dataIndex: "city", key: "city" },
        { title: "State or Province", dataIndex: "stateorprovince", key: "stateorprovince" }
    ];
    const applyFilters = (tab, search, sort) => {
        let data = [...originalData];

        // Tab filter
        if (tab !== "all") {
            data = data.filter((item) => item.status === tab);
        }

        // Search filter
        if (search) {
            data = data.filter((item) =>
                Object.values(item)
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        // Sort
        data.sort((a, b) => {
            if (sort === "newest") {
                return b.id - a.id;
            } else {
                return a.id - b.id;
            }
        });

        setFiteredData(data);
    };
    const handleTabChange = (key) => {
        setActiveTab(key);
        applyFilters(key, searchText, sortOrder);
    };

    const handleSearchChange = (value) => {
        setSearchText(value);
        applyFilters(activeTab, value, sortOrder);
    };

    const handleSortChange = (value) => {
        setSortOrder(value);
        applyFilters(activeTab, searchText, value);
    };
    const handleEdit = (record) => {
        setSelectedRecord(record);
        setOpen(true);
    };
    return (
        <div>
            <h1 className='text-md md:text-2xl font-semibold'>KYC Verfication Request Management</h1>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 mb-4 gap-3">

                <ReusableTabs
                    items={tabItems}
                    activeKey={activeTab}
                    onChange={handleTabChange}
                />

                <ReusableTableFilters
                    searchValue={searchText}
                    onSearchChange={handleSearchChange}
                    sortValue={sortOrder}
                    onSortChange={handleSortChange}
                />
            </div>
            <ReusableTable
                columns={columns}
                data={filteredData}
                actionLabel="Edit"
                onEdit={handleEdit}
            />
        </div>
    )
}

export default Kyc