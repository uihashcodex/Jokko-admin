import { useState, useEffect } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableModal from "../reuseable/ReusableModal";
import TableHeader from "../reuseable/TableHeader";
import axios from "axios";
import { constant } from "../const";
import { message } from 'antd';
import theme from '../config/theme';



const Assets = () => {

    const [originalData, setOriginalData] = useState([
        // {
        //     id: 1,
        //     sno: 1,
        //     tokenName: "USDC Coin Dev",
        //     tokenSymbol: "USDC-DEV",
        //     tokenDecimals: "9",
        //     contractAddress: "trdgsaxghdcghvdcghfydshjvhjNByggKjr",
        //     network_id: "69452d26e44c35cfed14774f"
        // },
        // {
        //     id: 2,
        //     sno: 2,
        //     tokenName: "BTC Coin Dev",
        //     tokenSymbol: "BTC-DEV",
        //     tokenDecimals: "9",
        //     contractAddress: "trdgsaxghdcghvdcghfydshjvhjNByggKjr",
        //     network_id: "69452d26e44c35cfed19974f"
        // }
    ]);
    const [networkOptions, setNetworkOptions] = useState([]);

    // const [networkOptions, setNetworkOptions] = [
    //     // { label: "Ethereum", value: "eth" },
    //     // { label: "BSC", value: "bsc" },
    //     // { label: "Polygon", value: "polygon" }
    // ];
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Token Name", dataIndex: "tokenName", key: "tokenName" },
        { title: "Token Symbol", dataIndex: "tokenSymbol", key: "tokenSymbol" },
        { title: "Token Decimals", dataIndex: "tokenDecimals", key: "tokenDecimals" },
        { title: "Contract Address", dataIndex: "contractAddress", key: "contractAddress" },
        { title: "Network Id", dataIndex: "network_id", key: "network_id" },
        { title: "Status", dataIndex: "status", key: "status" },
    ];

    // const fields = () => [
    //     {
    //         label: "Token Name", name: "tokenName", span: 12,
    //         rules: [
    //             { required: true, message: "Network Name is required" },
    //             { min: 3, message: "Network Name must be at least 3 characters" },
    //         ],
    //     },
    //     {
    //         label: "Token Symbol", name: "tokenSymbol", span: 12,
    //         rules: [
    //             { required: true, message: "Network Name is required" },
    //             { min: 3, message: "Network Name must be at least 3 characters" },
    //         ],
    //     },
    //     {
    //         label: "Token Decimals", name: "tokenDecimals", span: 12,
    //         rules: [
    //             // { required: true, message: "Network Name is required" },
    //             // { min: 2, message: "Network Name must be at least 2 characters" },
    //         ],
    //     },
    //     {
    //         label: "Contract Address", name: "contractAddress", span: 12,
    //         rules: [
    //             { required: true, message: "Network Name is required" },
    //             { min: 3, message: "Network Name must be at least 3 characters" },
    //         ],
    //     },
    //     {
    //         label: "Network Id",
    //         name: "network_id",
    //         type: "select",
    //         // rules: [{ required: true, message: "Network is required" }],
    //         options: networkOptions,


    //     }

    // ];



    const getFields = () => [
        {
            label: "Token Name",
            name: "tokenName",
            span: 12,
            rules: [
                { required: true, message: "Token Name is required" },
                { min: 3, message: "Minimum 3 characters" },
            ],
        },
        {
            label: "Token Symbol",
            name: "tokenSymbol",
            span: 12,
            rules: [
                { required: true, message: "Token Symbol is required" },
                { min: 3, message: "Minimum 3 characters" },
            ],
        },
        {
            label: "Token Decimals",
            name: "tokenDecimals",
            span: 12,
        },
        {
            label: "Contract Address",
            name: "contractAddress",
            span: 12,
            rules: [
                { required: true, message: "Contract Address is required" },
            ],
        },
        {
            label: "Network Id",
            name: "network_id",
            type: "select",
            options: networkOptions,   // 🔥 dynamic
            rules: [{ required: true, message: "Network is required" }],
        }
    ];
    const [filteredData, setFilteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [page, setPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();
    // const [select, setSelect] = useState(networkOptions);

    const handleCreate = () => {
        setSelectedAsset(null);
        setOpen(true);
    };

    const handleUpdate = (record) => {
        setSelectedAsset(record);
        setOpen(true);
    };

    // const handleSubmit = (values) => {

    //     if (selectedAsset) {
    //         // UPDATE
    //         const updatedData = originalData.map(item =>
    //             item.id === selectedAsset.id
    //                 ? { ...item, ...values }
    //                 : item
    //         );

    //         setOriginalData(updatedData);
    //         // setFilteredData(updatedData);

    //     } else {
    //         // CREATE
    //         const newItem = {
    //             id: originalData.length + 1,
    //             sno: originalData.length + 1,
    //             ...values
    //         };

    //         const updatedData = [...originalData, newItem];

    //         setOriginalData(updatedData);
    //         // setFilteredData(updatedData);
    //     }

    //     setOpen(false);
    // };





    const getToken = async () => {
        try {
            const response = await axios.post(
                `${constant.backend_url}/assets/get-all-tokens`,

                {

                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (response.data?.success) {

                const formattedData = response.data.result.docs.map((item, index) => ({

                    id: item?._id,
                    sno: index + 1,
                    tokenName: item?.tokenName,
                    tokenSymbol: item?.tokenSymbol,
                    contractAddress: item?.contractAddress || "***",
                    tokenDecimals: item?.decimals,
                    status: item?.verifyStatus == true ? "active" : "inactive",
                    network_id: item?.network_id._id,
                }));
                console.log(formattedData, "formattedData");
                setOriginalData(formattedData);
                setFilteredData(formattedData);

            } else {
                setOriginalData([]);
                setFilteredData([]);
            }

        } catch (error) {
            console.log(error);
            setOriginalData([]);
            setFilteredData([]);
        }
    };


    useEffect(() => {
        getToken();
    }, [page]);


    const handleSubmit = async (values) => {

        try {

            if (selectedAsset) {

                // const payload = {
                //     network_id: selectedAsset.id,
                //     ...values,
                //     verifyStatus: values.status === "active"
                // };
                const payload = {
                    ...values,
                    verifyStatus: values.status === "active"
                };

                const res = await axios.post(
                    // `${constant.backend_url}/assets/update-token/${selectedAsset.id}`, payload,

                    `${constant.backend_url}/assets/update-token`,
                    {
                        token_id: selectedAsset.id,
                        tokenName: values.tokenName,
                        tokenSymbol: values.tokenSymbol,
                        decimals: values.tokenDecimals,
                        contractAddress: values.contractAddress,
                        network_id: values.network_id
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                        validateStatus: () => true
                    }
                );

                if (res.data?.success) {
                    messageApi.success(res.data.message);
                    getToken();
                    setOpen(false);
                } else {
                    if (res.data?.message) {
                        messageApi.error(res.data.message);
                        return;
                    }
                }


            } else {
                const create = await axios.post(
                    `${constant.backend_url}/assets/add-tokens`, values,
                    {
                        headers: {
                            // "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                        validateStatus: () => true
                    }
                );

                if (create.data?.success) {
                    messageApi.success(create.data.message);
                    getToken();
                    setOpen(false);
                } else {
                    if (create.data?.message) {
                        messageApi.error(create.data.message);
                        return;
                    }
                }

            }


        } catch (error) {
            console.log(error);
            messageApi.error(error.message);
        }
    };


    const getNetwork = async () => {
        try {
            const response = await axios.post(
                `${constant.backend_url}/assets/get-all-networks?page=1&limit=10`,

                {

                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (response.data?.success) {
                const netWorkdata = response.data.result.docs.map((item, index) => ({
                    // id: item?._id,
                    label: item?.networkName.toUpperCase(),
                    value: item?._id,
                }));
                console.log(netWorkdata, "sssssss");

                setNetworkOptions(netWorkdata);
                // setSelect(netWorkdata[0]?.value);

            } else {
                setNetworkOptions([]);
                // setSelect([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }

    }

    useEffect(() => {
        getNetwork();
    }, []);

    useEffect(() => {
        console.log("networkOptions updated:", networkOptions);
    }, [networkOptions]);
    return (
        <>
               
                <div
                    className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center"
                    style={{
                        backgroundImage: `url(${theme.dashboardheaderimg.image})`,
                        height: theme.dashboardheaderimg.height
                    }}
                >
                    <div className="display-3 w-full">
                    <h1 className="text-white p-7 font-bold text-2xl">
                        Asset                </h1>
                    </div>
                </div>
            
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
                key={networkOptions.length}
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                title={selectedAsset ? "Update Asset" : "Create Asset"}
                fields={getFields()}
                initialValues={selectedAsset}
                maskClosable={false}
            />
        </>
    );
};

export default Assets;
