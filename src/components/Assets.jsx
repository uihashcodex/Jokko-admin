import { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableModal from "../reuseable/ReusableModal";
import TableHeader from "../reuseable/TableHeader";
const Assets = () => {

    const [originalData, setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            tokenName: "USDC Coin Dev",
            tokenSymbol: "USDC-DEV",
            tokenDecimals: "9",
            contractAddress: "trdgsaxghdcghvdcghfydshjvhjNByggKjr",
            network_id: "69452d26e44c35cfed14774f"
        },
        {
            id: 2,
            sno: 2,
            tokenName: "BTC Coin Dev",
            tokenSymbol: "BTC-DEV",
            tokenDecimals: "9",
            contractAddress: "trdgsaxghdcghvdcghfydshjvhjNByggKjr",
            network_id: "69452d26e44c35cfed19974f"
        }
    ]);

    const networkOptions = [
        { label: "Ethereum", value: "eth" },
        { label: "BSC", value: "bsc" },
        { label: "Polygon", value: "polygon" }
    ];
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Token Name", dataIndex: "tokenName", key: "tokenName" },
        { title: "Token Symbol", dataIndex: "tokenSymbol", key: "tokenSymbol" },
        { title: "Token Decimals", dataIndex: "tokenDecimals", key: "tokenDecimals" },
        { title: "Contract Address", dataIndex: "contractAddress", key: "contractAddress" },
        { title: "Network Id", dataIndex: "network_id", key: "network_id" },
    ];

    const fields = [
        { label: "Token Name", name: "tokenName" },
        { label: "Token Symbol", name: "tokenSymbol" },
        { label: "Token Decimals", name: "tokenDecimals" },
        { label: "Contract Address", name: "contractAddress" },
        {
            label: "Network Id",
            name: "network_id",
            type: "multiselect",      // ✅ Important
            options: networkOptions
        }
    ];
    const [filteredData, setFilteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);


    const handleCreate = () => {
        setSelectedAsset(null);
        setOpen(true);
    };

    const handleUpdate = (record) => {
        setSelectedAsset(record);
        setOpen(true);
    };

    const handleSubmit = (values) => {

        if (selectedAsset) {
            // UPDATE
            const updatedData = originalData.map(item =>
                item.id === selectedAsset.id
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

            <ReusableModal
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                title={selectedAsset ? "Update Asset" : "Create Asset"}
                fields={fields}
                initialValues={selectedAsset}
                maskClosable={false} 
            />
        </>
    );
};

export default Assets;
