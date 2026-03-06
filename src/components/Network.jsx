import { useEffect, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import axios from "axios";
import { constant } from "../const";
import Search from "antd/es/transfer/search";
import { Flex, message } from 'antd';
import { rule } from "postcss";
import theme from '../config/theme';




const Network = () => {
    const [originalData, setOriginalData] = useState([
        // {
        //     id: 1,
        //     sno: 1,
        //     networkname: "Ripple",
        //     networksymbol: "XRP",
        //     rpcUrl: "https://s1.ripple.com:51234",
        //     blockExplorerUrl: "https://xrpscan.com/",
        //     type: "xrp"
        // },
        // {
        //     id: 2,
        //     sno: 2,
        //     networkname: "Zipple",
        //     networksymbol: "EVM",
        //     rpcUrl: "https://s1.Zipple.com:51234",
        //     blockExplorerUrl: "https://evmscan.com/",
        //     type: "xrp"
        // }

    ]);
    const [page, setPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();


    // const [filteredData, setFilteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);

    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Network Name", dataIndex: "networkname", key: "networkname" },
        { title: "Network Symbol", dataIndex: "networksymbol", key: "networksymbol" },
        { title: "Rpc Url", dataIndex: "rpcUrl", key: "rpcUrl" },
        { title: "BlockExplorer Url", dataIndex: "blockExplorerUrl", key: "blockExplorerUrl" },
        { title: "Status", dataIndex: "status", key: "status" }
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const fields = [
        {
            label: "Network Name",
            name: "networkName",
            span: 12,
            rules: [
                { required: true, message: "Network Name is required" },
                { min: 3, message: "Network Name must be at least 3 characters" },
            ],

        },
        {
            label: "Network Symbol",
            name: "networkSymbol",
            span: 12,
            rules: [
                { required: true, message: "Network Symbol is required" },
                { min: 3, message: "Network Symbol must be at least 3 characters" },
            ],
        },
        {
            label: "RPC URL",
            name: "rpcUrl",
            span: 12,
            rules: [
                { required: true, message: "RPC URL is required" },
                {
                    pattern: /^https?:\/\/.+/,
                    message: "Enter valid RPC URL",
                },
            ],
        },
        {
            label: "Block Explorer URL",
            name: "blockExplorerUrl",
            span: 12,
            rules: [
                { required: true, message: "Block Explorer URL is required" },
                {
                    pattern: /^https?:\/\/.+/,
                    message: "Enter valid Block Explorer URL",
                },
            ]
        },
        {
            label: "Type",
            name: "type",
            span: 12,
            rules: [
                { required: true, message: "Type is required" },
                { min: 3, message: "Type must be at least 3 characters" },
            ],

        },
        {
            label: "Status",
            name: "status",
            type: "select",
            options: statusOptions
        }
    ];

    const handleCreate = () => {
        setOpen(true);
        setSelectedRecord(null);
    };
    ;


    //    const handleSubmit = (values) => {

    //     if (selectedRecord) {
    //         // UPDATE
    //         const updatedData = originalData.map(item =>
    //             item.id === selectedRecord.id
    //                 ? { ...item, ...values }
    //                 : item
    //         );

    //         setOriginalData(updatedData);
    //         setFilteredData(updatedData);

    //     } else {
    //         // CREATE
    //         const newItem = {
    //             id: originalData.length + 1,
    //             sno: originalData.length + 1,
    //             ...values
    //         };

    //         const updatedData = [...originalData, newItem];

    //         setOriginalData(updatedData);
    //         setFilteredData(updatedData);
    //     }

    //     setOpen(false);
    // };
    const modalFields = selectedRecord
        ? fields
        : fields.filter(f => f.name !== "status");


    const [filters, setFilters] = useState({
        search: "",
        type: "",
        verifyStatus: ""
    });


    // const getNetworks = async () => {
    //     try {
    //         const cleanFilters = Object.fromEntries(
    //             Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
    //         );

    //         // const response = await axios.post(
    //         //     `${constant.backend_url}/assets/get-all-networks`,
    //         //     {},
    //         //     {
    //         //         params: {
    //         //         ...cleanFilters,
    //         //             page: page,
    //         //             limit: 10
    //         //         }
    //         //     },
    //         //     {
    //         //         headers: {
    //         //             "Content-Type": "application/json",
    //         //             Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    //         //         },
    //         //     }
    //         // );
    //         const response = await axios.post(
    //             `${constant.backend_url}/assets/get-all-networks`,
    //             {},
    //             {
    //                 params: {
    //                     ...cleanFilters,
    //                     page: page,
    //                     limit: 10
    //                 },
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    //                 }
    //             }
    //         );
    //         if (response.data?.success) {
    //             const docs = response.data.result.docs || [];

    //             setTotalUsers(response.data.result.totalDocs);

    //             console.log(response.data.result.docs[0]?.verifyStatus, "dfghjkl");
    //             const formattedData = docs.map((item, index) => ({


    //                 id: item?._id,
    //                 sno: (page - 1) * 10 + index + 1,
    //                  networkname: item?.networkName,
    //                 networksymbol: item?.networkSymbol,
    //                 rpcUrl: item?.rpcUrl,
    //                 blockExplorerUrl: item?.blockExplorerUrl,
    //                 status: item?.verifyStatus == true ? "active" : "inactive",
    //                 // status: item?.verifyStatus ? "active" : "inactive",
    //                 // status: item?.verifyStatus,
    //                 type: item?.type
    //             }));
    //             console.log(formattedData, "formattedData");
    //             setOriginalData(formattedData);
    //             // setFilteredData(formattedData);

    //         } else {
    //             setOriginalData([]);
    //             // setFilteredData([]);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //         setOriginalData([]);
    //         // setFilteredData([]);
    //     }
    // };

 

    const getNetworks = async () => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
            );

            const response = await axios.post(
                `${constant.backend_url}/assets/get-all-networks`,
                {

                    ...cleanFilters,
                    page: page,
                    limit: 10
                },
                {
                  
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    }
                }
            );

            if (response.data?.success) {

                const docs = response.data.result.docs || [];

                setTotalUsers(response.data.result.totalDocs);

                const formattedData = docs.map((item, index) => ({
                    id: item._id,
                    sno: (page - 1) * 10 + index + 1,
                    networkname: item.networkName,
                    networksymbol: item.networkSymbol,
                    rpcUrl: item.rpcUrl,
                    blockExplorerUrl: item.blockExplorerUrl,
                    status: item.verifyStatus == true ? "active" : "inactive",
                    type: item.type
                }));

                setOriginalData(formattedData);

            } else {
                setOriginalData([]);
            }

        } catch (error) {
            console.log(error);
            setOriginalData([]);
        }
    };
    useEffect(() => {
        getNetworks();
    }, [page, filters]);

    const updateFilter = (key, value) => {

        if (key === "verifyStatus") {
            value = value === "active" ? "true" : value === "inactive" ? "false" : "";
        }

        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };





    // const handleSubmit = async (values) => {
    //     try {
    //         if (selectedRecord) {
    //             // UPDATE
    //             const updatedData = originalData.map(item =>
    //                 item.id === selectedRecord.id
    //                     ? { ...item, ...values }
    //                     : item
    //             );

    //             setOriginalData(updatedData);
    //             setFilteredData(updatedData);
    //         }
    //         else {
    //             // CREATE NETWORK API
    //             const { data } = await axios.post(
    //                 `${constant.backend_url}/assets/add-network`,
    //                 values,
    //                 {
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    //                     },
    //                 }
    //             );

    //             if (data.success) {
    //                 getNetworks(); // refresh table
    //                 setOpen(false);
    //             }
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };


    const handleSubmit = async (values) => {
        try {
            if (selectedRecord) {

                const payload = {
                    network_id: selectedRecord.id,
                    networkName: values.networkname,
                    networkSymbol: values.networksymbol,
                    rpcUrl: values.rpcUrl,
                    blockExplorerUrl: values.blockExplorerUrl,
                    type: values.type,
                    verifyStatus: values.status === "active"
                };

                console.log("VALUES:", values);
                console.log("PAYLOAD:", payload);
                console.log(values.status);
                const res = await axios.post(
                    `${constant.backend_url}/assets/update-network`,
                    payload,

                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,

                        },
                        validateStatus: () => true,
                    }

                );


                if (res.data.success) {
                    messageApi.success("Network updated successfully");
                    getNetworks();
                    setOpen(false);
                } else {
                    if (!res.data.success) {
                        messageApi.warning(res.data.message || "Something went wrong");
                        return;
                    }
                }
                console.log(res, "res");


            } else {
                // const payload = {
                //     networkName: values.networkname,
                //     networkSymbol: values.networksymbol,
                //     rpcUrl: values.rpcUrl,
                //     blockExplorerUrl: values.blockExplorerUrl,
                //     type: values.type
                // };
                const res = await axios.post(
                    `${constant.backend_url}/assets/add-network`,
                    {
                        networkName: values.networkName,
                        networkSymbol: values.networkSymbol,
                        rpcUrl: values.rpcUrl,
                        blockExplorerUrl: values.blockExplorerUrl,
                        type: values.type
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                    }
                );

                if (res.data?.success) {
                    messageApi.success("Network added successfully");
                    getNetworks();
                    setOpen(false);
                } else {
                    messageApi.warning(res.data?.message || "Something went wrong");

                }
            }

        } catch (error) {
            console.log(error);
            messageApi.error("Something went wrong");
        }
    };
    const handleUpdate = (record) => {
        setSelectedRecord({
            id: record.id,
            networkName: record.networkname,
            networkSymbol: record.networksymbol,
            rpcUrl: record.rpcUrl,
            blockExplorerUrl: record.blockExplorerUrl,
            type: record.type,
            status: record.status
        });
        setOpen(true);
    };


    // const updateNetwork = async (details) => {
    //     try {
    //         console.log(details)
    //         const { data } = await axios.post(`/assets/add-network`,
    //             details,
    //             {
    //                 headers: {
    //                     Authorization: localStorage.getItem("adminToken"),
    //                 },
    //             }
    //         );
    //         if (data.success) {
    //             toast.success("Network Updated Successfully");
    //             getNetworks();
    //             handleClose();
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // }


    return (
        < div Style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", width: "100%" }}>
            <>
                {contextHolder}

                <div
                    className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center"
                    style={{
                        backgroundImage: `url(${theme.dashboardheaderimg.image})`,
                        height: theme.dashboardheaderimg.height
                    }}
                >
                    <div className="display-3 w-full">
                        <h1 className="text-white p-7 font-bold text-2xl">
                            Network                </h1>
                    </div>
                </div>

                <TableHeader
                    data={originalData}
                    // onFilter={setFilteredData}
                    onCreate={handleCreate}
                    showStatusFilter={true}
                    onSearch={(value) => updateFilter("search", value)}
                    onTypeChange={(value) => updateFilter("type", value)}
                    onVerifyChange={(value) => updateFilter("verifyStatus", value)}
                />
                <ReusableTable
                    columns={columns}
                    data={originalData}
                    onUpdate={handleUpdate}
                    pageSize={10}
                    total={totalUsers}
                    currentPage={page}
                    onPageChange={(p) => setPage(p)} 
                    />

                <ReusableModal
                    open={open}
                    onCancel={() => setOpen(false)}
                    onSubmit={handleSubmit}
                    title={selectedRecord ? "Update Network" : "Create Network"}
                    fields={modalFields}
                    initialValues={selectedRecord}
                />
            </>
        </div>
    );
};

export default Network;
