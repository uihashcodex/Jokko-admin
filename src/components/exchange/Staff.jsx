import {useState} from 'react';
import ReusableTable from '../../reuseable/ReusableTable';

const Staff = () => {
    const originalData = [
        {
            id: 1,
            sno: 1,
            name:"demo",
            username: "Ramesh Kumar",
            email:"demo@demo.com",
            Phone: "04904904",
            Role: "User Management",
            Platform: "Apzex",
            Status:"not Active"
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
    const [filteredData, setFiteredData] = useState(originalData);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "User Name", dataIndex: "username", key: "username" },
        { title: "From Type", dataIndex: "fromtype", key: "fromtype" },
        { title: "To Type", dataIndex: "totype", key: "totype" },
        { title: "Amount", dataIndex: "amount", key: "amount" },
        { title: "Date", dataIndex: "date", key: "date" }
    ];
    return (
        <div>
            <h1 className='text-sm md:text-2xl font-semibold'>Staff Management</h1>
            <ReusableTable
                columns={columns}
                data={filteredData}
                actionLabel="Action"
            />
        </div>
    )
}

export default Staff