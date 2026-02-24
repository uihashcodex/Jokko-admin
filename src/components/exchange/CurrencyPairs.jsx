import { useState, useEffect } from 'react'

import ReusableTable from '../../reuseable/ReusableTable';
import ReusableModal from '../../reuseable/ReusableModal';
import TableHeader from '../../reuseable/TableHeader';

const CurrencyPairs = () => {
    const [originalData, setOriginalData] = useState([
        {
            id: 1,
            sno: 1,
            symbol: "DOGE_USDC",
            basecurrency: "DOGE",
            tradecurrency: "USDC",
            status: "Active",
            createdat: "18.09.2025"
        },
        {
            id: 2,
            sno: 2,
            symbol: "TIA_USDC",
            basecurrency: "TIA",
            tradecurrency: "USDC",
            status: "Active",
            createdat: "13.12.2025"
        }
    ]);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Symbol", dataIndex: "symbol", key: "symbol" },
        { title: "Base Currency", dataIndex: "basecurrency", key: "basecurrency" },
        { title: "Trade Currency", dataIndex: "tradecurrency", key: "tradecurrency" },
        { title: "Base Currency", dataIndex: "status", key: "status" },
        { title: "Created At", dataIndex: "createdat", key: "createdat" }
    ];
    const [filteredData, setFiteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
   const handleEdit = (record) => {
    const formattedRecord = {
        ...record,
        baseAsset: record.basecurrency,
        marketAsset: record.tradecurrency,
        status: record.status === "Active",
    };

    setSelectedRecord(formattedRecord);
    setOpen(true);
};

    const handleDelete = (record) => {
        setOriginalData(prev => prev.filter(item => item.id !== record.id));
    };
    const handleSubmit = (values) => {
        if (selectedRecord) {
            // Edit
            const updated = originalData.map(item =>
                item.id === selectedRecord.id
                    ? { ...item, ...values }
                    : item
            );
            setOriginalData(updated);
            setFiteredData(updated);
        } else {
            // Create
            const newItem = {
                id: Date.now(),
                sno: originalData.length + 1,
                symbol: `${values.baseAsset}_${values.marketAsset}`,
                basecurrency: values.baseAsset,
                tradecurrency: values.marketAsset,
                status: values.status ? "Active" : "Inactive",
                createdat: new Date().toLocaleDateString(),
            };

            const updated = [...originalData, newItem];
            setOriginalData(updated);
            setFiteredData(updated);
        }

        setOpen(false);
    };
    const fields = [
        {
            name: "baseAsset",
            label: "Base Asset Name",
            type: "text",
            span: 12,
            disabled: !!selectedRecord  
        },
        {
            name: "marketAsset",
            label: "Market Asset Name",
            type: "text",
            span: 12,
            disabled: !!selectedRecord
        },
        {
            name: "pointFilter",
            label: "Point Filter",
            type: "text",
            span: 12,
        },
        {
            name: "basePrecision",
            label: "Base Precision",
            type: "text",
            span: 12,
        },
        {
            name: "quotePrecision",
            label: "Quote Precision",
            type: "text",
            span: 12,
        },
        {
            name: "buyCommissionType",
            label: "Buy Trade Commission Type",
            type: "select",
            span: 12,
            options: [
                { label: "Percentage", value: "percentage" },
                { label: "Fixed", value: "fixed" },
            ],
        },
        {
            name: "sellCommissionType",
            label: "Sell Trade Commission Type",
            type: "select",
            span: 12,
            options: [
                { label: "Percentage", value: "percentage" },
                { label: "Fixed", value: "fixed" },
            ],
        },
        {
            name: "buyCommission",
            label: "Buy Trade Commission",
            type: "text",
            span: 12,
        },
        {
            name: "sellCommission",
            label: "Sell Trade Commission",
            type: "text",
            span: 12,
        },
        {
            name: "pairImage",
            label: "Pair Image",
            type: "image",
            span: 24,
        },
        {
            name: "status",
            label: "Status",
            type: "switch",
            span: 12,
        },
        {
            name: "ownTrade",
            label: "Own Trade",
            type: "switch",
            span: 12,
        },
    ];
    useEffect(() => {
        setFiteredData(originalData);
    }, [originalData]);
    return (
        <div>
            <h1 className='text-md md:text-2xl font-semibold'>Currency Pair Management</h1>
            <TableHeader
                data={originalData}
                onFilter={setFiteredData}
                onCreate={() => {
                    setSelectedRecord(null);
                    setOpen(true);
                }}
            />
            <ReusableTable
                columns={columns}
                data={filteredData}
                actionType="action"
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <ReusableModal
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                title={selectedRecord ? "Edit Currency Pair" : "Create Currency Pair"}
                fields={fields}
                initialValues={selectedRecord}
            />
        </div>
    )
}

export default CurrencyPairs