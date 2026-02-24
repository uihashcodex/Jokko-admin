import { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";


const Network = () => {
    const [originalData,setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            networkname: "Ripple",
            networksymbol: "XRP",
            rpcUrl: "https://s1.ripple.com:51234",
            blockExplorerUrl: "https://xrpscan.com/",
            type: "xrp"
        },
        {
            id: 2,
            sno: 2,
            networkname: "Zipple",
            networksymbol: "EVM",
            rpcUrl: "https://s1.Zipple.com:51234",
            blockExplorerUrl: "https://evmscan.com/",
            type: "xrp"
        }
    ]);
    const [filteredData, setFilteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Network Name", dataIndex: "networkname", key: "networkname" },
        { title: "Network Symbol", dataIndex: "networksymbol", key: "networksymbol" },
        { title: "Rpc Url", dataIndex: "rpcUrl", key: "rpcUrl" },
        { title: "BlockExplorer Url", dataIndex: "blockExplorerUrl", key: "blockExplorerUrl" }
    ];
    const fields = [
        { label: "Network Name", name: "networkname" },
        { label: "Network Symbol", name: "networksymbol" },
        { label: "RPC URL", name: "rpcUrl" },
        { label: "Block Explorer URL", name: "blockExplorerUrl" },
        { label: "Type", name: "type" }
    ];

    const handleCreate = () => {
        setOpen(true);
        setSelectedRecord(null);
    };


    const handleUpdate = (record) => {
        setSelectedRecord(record);
        setOpen(true);
    };

       const handleSubmit = (values) => {

        if (selectedRecord) {
            // UPDATE
            const updatedData = originalData.map(item =>
                item.id === selectedRecord.id
                    ? { ...item, ...values }
                    : item
            );

            setOriginalData(updatedData);
            setFilteredData(updatedData);

        } else {
            // CREATE
            const newItem = {
                id: originalData.length + 1,
                sno: originalData.length + 1,
                ...values
            };

            const updatedData = [...originalData, newItem];

            setOriginalData(updatedData);
            setFilteredData(updatedData);
        }

        setOpen(false);
    };

    return (
        <>
            <TableHeader
                data={originalData}
                onFilter={setFilteredData}
                onCreate={handleCreate}
            />
            <ReusableTable
                columns={columns}
                data={filteredData}
                onUpdate={handleUpdate}                
            />

            {/* <Modal
                title="Update Network"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                centered
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Network Name" name="name">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Network Symbol" name="symbol">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Site URL" name="siteUrl">
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Deposit Enable"
                        name="deposit"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="Withdraw Enable"
                        name="withdraw"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Row justify="start">
                        <Col>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal> */}
            <ReusableModal
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                title={selectedRecord ? "Update Network" : "Create Network"}
                fields={fields}
                initialValues={selectedRecord}
            />

        </>
    );
};

export default Network;
