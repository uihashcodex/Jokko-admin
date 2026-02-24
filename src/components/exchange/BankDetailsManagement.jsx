import { useState } from 'react'
import { Button } from "antd";
import ReusableTable from '../../reuseable/ReusableTable';
import ReusableModal from '../../reuseable/ReusableModal';
const BankDetailsManagement = () => {
    const [originalData, setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            bankname: "NedBank",
            brancecode: "198765",
        },
        {
            id: 2,
            sno: 2,
            bankname: "sample",
            brancecode: "195665",
        }
    ]);
    const [filteredData, setFiteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Bank Name", dataIndex: "bankname", key: "bankname" },
        { title: "Brance Code", dataIndex: "brancecode", key: "brancecode" },
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
        { name: "bankname", label: "Bank Name", type: "text", span:12},
        { name: "brancecode", label: "Branch Code", type: "text",span:12 },
    ];
    return (
        <div>
            <div>
                <ReusableTable
                    title="Bank Details Management"
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
        </div>
    )
}

export default BankDetailsManagement