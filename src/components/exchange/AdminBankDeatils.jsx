import { useState } from 'react';
import { Button } from "antd";
import ReusableTable from '../../reuseable/ReusableTable';
import ReusableModal from '../../reuseable/ReusableModal';

const AdminBankDeatils = () => {
    const [originalData, setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            bankname: "NedBank",
            accountholdername: "APZOR(PTY)LTD",
            accountnumber: "130798609",
            swiftcode: "SWIFT212",
            brancecode: "198765",
            defaultaccount: "NO"
        },
        {
            id: 2,
            sno: 2,
            bankname: "sample",
            accountholdername: "APZOR(PTY)LTD",
            accountnumber: "1307997609",
            swiftcode: "SWIFT232",
            brancecode: "195665",
            defaultaccount: "NO"
        }
    ]);
    const [filteredData,setFiteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Bank Name", dataIndex: "bankname", key: "bankname" },
        { title: "Account Holder Name", dataIndex: "accountholdername", key: "accountholdername" },
        { title: "Accoun tNumber", dataIndex: "accountnumber", key: "accountnumber" },
        { title: "Swift Code", dataIndex: "swiftcode", key: "swiftcode" },
        { title: "Brance Code", dataIndex: "brancecode", key: "brancecode" },
        { title: "Default Account", dataIndex: "defaultaccount", key: "defaultaccount" },
    ];
    const handleEdit = (record) => {
        setSelectedRecord(record);
        setOpen(true);
    };

    const handleDelete = (record) => {
        setOriginalData(prev => prev.filter(item => item.id !== record.id));
    };
    const handleSubmit = (values) => {
        const updated = originalData.map(item =>
            item.id === selectedRecord.id
                ? { ...item, ...values }
                : item
        );

        setFiteredData(updated);
        setOpen(false);
    };

    const fields = [
        { name: "bankname", label: "Bank Name", type: "text",span:12 },
        { name: "accountholdername", label: "Account Holder Name", type: "text",span:12 },
        { name: "accountnumber", label: "Account Number", type: "text", span:12},
        { name: "swiftcode", label: "Swift Code", type: "text",span:12 },
        { name: "brancecode", label: "Branch Code", type: "text", span:12},
    ];
    return (
        <div>
            <ReusableTable
                title="Add Bank Details"
                columns={columns}
                data={filteredData}
                actionType="action"
                onEdit={handleEdit}
                onDelete={handleDelete}
                extra={
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedRecord(null);
                            setOpen(true);
                        }}
                    >
                        + Add Bank Account
                    </Button>
                }
            />
            <ReusableModal
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                title="Edit Bank Details"
                fields={fields}
                initialValues={selectedRecord}
            />
        </div>
    )
}

export default AdminBankDeatils