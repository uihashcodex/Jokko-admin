import { useState } from 'react'
import { Input } from "antd";
import ReusableTable from '../../reuseable/ReusableTable';

const UserList = () => {
    const [originalData, setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            name: "john",
            email: "john@gmail.com",
            phone: "32234234234",
            referralcode: "TLX135159",
            status: "unverified",
        },
        {
            id: 2,
            sno: 2,
            name: "Suhail Govender",
            email: "suhailgovender1@gmail.com",
            phone: "817360195",
            referralcode: "TLX577075",
            status: "unverified",
        }
    ]);
    const [filteredData, setFiteredData] = useState(originalData);
    const [searchText, setSearchText] = useState("");
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Phone", dataIndex: "phone", key: "phone" },
        { title: "Referral Code", dataIndex: "referralcode", key: "referralcode" },
        { title: "Status", dataIndex: "status", key: "status" }
    ];
    const handleSearch = (value) => {
        setSearchText(value);

        const filtered = originalData.filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.email.toLowerCase().includes(value.toLowerCase())
        );

        setFiteredData(filtered);
    };
    return (
        <div>
            <ReusableTable
                title="User Management"
                columns={columns}
                data={filteredData}
                actionLabel="Action"
                extra={
                    <Input
                        placeholder="Search Name or Email"
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full md:w-60"
                        allowClear
                    />
                }
            />
        </div>
    )
}

export default UserList