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
    const [originalData, setOriginalData] = useState([]);
    const [page, setPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [deletemodal, setDeletemodal] = useState(false);

    // const [filteredData, setFilteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [deleteRecord, setDeleteRecord] = useState(null);
    const [forceDeleteModal, setForceDeleteModal] = useState(false);
    const [deleteTokens, setDeleteTokens] = useState([]);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Network Name", dataIndex: "networkname", key: "networkname" },
        { title: "Network Symbol", dataIndex: "networksymbol", key: "networksymbol" },

        { title: "Chain Id", dataIndex: "chainId", key: "chainId" },

        { title: "Rpc Url", dataIndex: "rpcUrl", key: "rpcUrl" },
        { title: "BlockExplorer Url", dataIndex: "blockExplorerUrl", key: "blockExplorerUrl" },
        { title: "Mode Status", dataIndex: "modeStatus", key: "modeStatus" },
        { title: "Status", dataIndex: "status", key: "status" }
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    const typeOptions = [
        { label: "EVM", value: "EVM" },
        { label: "NON-EVM", value: "NON-EVM" },
    ];
    const modeOptions = [
        { label: "Mainnet", value: "mainnet" },
        { label: "Testnet", value: "testnet" },
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
            label: "Chain ID",
            name: "chainId",
            span: 12,
            rules: [
                { required: true, message: "Chain ID is required" },
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
            type: "select",
            options: typeOptions,
            rules: [
                { required: true, message: "Type  is required" }
            ]
        },
        {
            label: "Mode Status",
            name: "modeStatus",
            type: "select",
            options: modeOptions,
            span: 12,
            rules: [
                { required: true, message: "Mode Status is required" }
            ]
        },
        {
            label: "Status",
            name: "status",
            type: "select",
            options: statusOptions,
            span: 12,
            rules: [
                { required: true, message: "Status is required" }
            ]

        },


    ];

    const handleCreate = () => {
        setOpen(true);
        setSelectedRecord(null);
    };
    ;



    const modalFields = selectedRecord
        ? fields
        : fields.filter(f => f.name !== "status");


    const [filters, setFilters] = useState({
        search: "",
        type: "",
        status: "",
        modeStatus: "",
        fromDate: "",
        toDate: ""
    });




    const getNetworks = async () => {
        try {
            setLoading(true);
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== "")
            );
            console.log("NETWORK FILTER BODY:", {
                ...cleanFilters,
                page,
                limit: 10
            });
            const startTime = Date.now();
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
                    chainId: item.chainId || "-",
                    rpcUrl: item.rpcUrl,
                    blockExplorerUrl: item.blockExplorerUrl,
                    status: item.verifyStatus == true ? "active" : "inactive",
                    type: item.type,
                    modeStatus: item.modeStatus
                }));

                setOriginalData(formattedData);

            }
            const elapsed = Date.now() - startTime;
            const remaining = 500 - elapsed;

            setTimeout(() => {
                setLoading(false);
            }, remaining > 0 ? remaining : 0);

        } catch (error) {
            console.log(error);
            setOriginalData([]);
        }


    };
    useEffect(() => {
        getNetworks();
    }, [page, filters]);

    const updateFilter = (key, value) => {

        if (key === "status") {
            value = value === "active" ? "true" : value === "inactive" ? "false" : "";
        }

        if (key === "modeStatus") {
            value = value?.toLowerCase() || "";
        }

        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(1);
    };




    const handleSubmit = async (values) => {
        const startTime = Date.now();

        try {
            setLoading(true);

            if (selectedRecord) {

                const payload = {
                    network_id: selectedRecord.id,
                    networkName: values.networkname,
                    chainId: values.chainId,
                    networkSymbol: values.networksymbol,
                    rpcUrl: values.rpcUrl,
                    blockExplorerUrl: values.blockExplorerUrl,
                    type: values.type,
                    modeStatus: values.modeStatus,
                    verifyStatus: values.status === "active"
                };

               const isSame =
                    payload.networkName === selectedRecord.networkname &&
                    payload.chainId === selectedRecord.chainId &&
                    payload.networkSymbol === selectedRecord.networksymbol &&
                    payload.rpcUrl === selectedRecord.rpcUrl &&
                    payload.blockExplorerUrl === selectedRecord.blockExplorerUrl &&
                    payload.type === selectedRecord.type &&
                    payload.modeStatus === selectedRecord.modeStatus &&
                    payload.verifyStatus === (selectedRecord.status === "active");
                if (isSame) {
                    message.error("No changes detected");
                    setLoading(false);
                    return;
                }

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
                        messageApi.warning(res.data.message || "Network Already Exists");
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
                        chainId: values.chainId,
                        rpcUrl: values.rpcUrl,
                        blockExplorerUrl: values.blockExplorerUrl,
                        type: values.type,
                        modeStatus: values.modeStatus 
                        

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
                    messageApi.warning("Network Already Exists");

                }
            }

        } catch (error) {
            console.log(error);
            messageApi.error("Network Already Exists");
        }
        finally {

            const elapsed = Date.now() - startTime;
            const minTime = 800; // loader minimum 800ms

            setTimeout(() => {
                setLoading(false);
            }, Math.max(minTime - elapsed, 0));

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
            chainId: record.chainId,
            status: record.status,
            modeStatus: record.modeStatus
        });
        setOpen(true);
    };

    // const handleDelete = async (forceDelete = false) => {
    //     try {
    //         setLoading(true);

    //         const res = await axios.post(
    //             `${constant.backend_url}/assets/delete-network`,
    //             {
    //                 network_id: deleteRecord.id,
    //                 ...(forceDelete && { force: true })

    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    //                 },
    //                 validateStatus: () => true

    //             }
    //         );

         
    //         if (!res.data.success && res.data.result?.tokenCount > 0) {

    //             setDeleteTokens(res.data.result.tokens);
    //             setDeletemodal(false);
    //             setDeletemodal(true);

    //             return;
    //         }

    //         if (res.data?.success) {
    //             message.success("Network and related tokens deleted successfully");
    //             setForceDeleteModal(false);
    //             setDeletemodal(false);
    //             getNetworks();
    //             return;
    //         } 

    //     } catch (error) {
    //         message.error("Delete failed");
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    // const handleDelete = async (forceDelete = false) => {
    //     try {
    //         setLoading(true);

    //         const res = await axios.post(
    //             `${constant.backend_url}/assets/delete-network`,
    //             {
    //                 network_id: deleteRecord.id,
    //                 // ...(forceDelete && { force: true })
    //             },
                
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    //                 },
    //                 validateStatus: () => true
    //             }
    //         );

    //         if (!res.data.success && res.data.result?.tokenCount > 0) {

    //             setDeleteTokens(res.data.result.tokens);

    //             setLoading(false);

    //             setDeletemodal(false);
    //             setForceDeleteModal(true);

    //             return;
    //         }

    //         if (res.data.success) {

    //             message.success(res.data.message);

    //             setForceDeleteModal(false);
    //             setDeletemodal(false);

    //             getNetworks();
    //         }

    //     } catch (error) {
    //         message.error("Delete failed");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleDelete = async (forceDelete = false) => {
        try {
            setLoading(true);

            const payload = {
                network_id: deleteRecord.id
            };

            // only add force when needed
            if (forceDelete) {
                payload.force = true;
            }

            const res = await axios.post(
                `${constant.backend_url}/assets/delete-network`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                    validateStatus: () => true
                }
            );

            // tokens exist → show second modal
            if (!res.data.success && res.data.result?.tokenCount > 0) {

                setDeleteTokens(res.data.result.tokens);

                setDeletemodal(false);
                setForceDeleteModal(true);

                return;
            }

            // success delete
            if (res.data.success) {

                message.success(res.data.message || "Deleted successfully");

                setForceDeleteModal(false);
                setDeletemodal(false);

                getNetworks();
            }

        } catch (error) {
            message.error("Delete failed");
        } finally {
            setLoading(false);
        }
    };
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
                    onVerifyChange={(value) => updateFilter("status", value)}
                    searchTooltip="Search by Chain Id, Network Symbol,  Network Name"
                    onNetChange={(value) => updateFilter("modeStatus", value)}
                    showNetFilter={true}
                    showDateFilter={true}
                    onDateChange={(dates) => {
                        updateFilter("fromDate", dates?.[0] || "");
                        updateFilter("toDate", dates?.[1] || "");
                    }}
                />
                <ReusableTable
                    columns={columns}
                    data={originalData}
                    onUpdate={handleUpdate}
                    pageSize={10}
                    total={totalUsers}
                    currentPage={page}
                    onDelete={(record) => {
                        setDeleteRecord(record);
                        setDeletemodal(true);
                    }}
                    onPageChange={(p) => setPage(p)}
                    loading={loading}
                    actionType={["update", "Remove"]}

                />

                <ReusableModal
                    open={open}
                    onCancel={() => setOpen(false)}
                    onSubmit={handleSubmit}
                    title={selectedRecord ? "Update Network" : "Create Network"}
                    fields={modalFields}
                    initialValues={selectedRecord}
                />

                <ReusableModal
                    open={deletemodal}
                    onCancel={() => setDeletemodal(false)}
                    title="Delete Network"
                    showFooter={false}
                    description={"Are you sure you want to delete this network?"}
                    extraContent={
                        <div className="text-center">

                            <p className="text-gray-300 text-base">
                                Are you sure you want to delete this network?
                            </p>

                            <div className="flex justify-between gap-4 mt-6">
                                <button
                                    className="px-6 py-2 rounded primaty-bg text-black"
                                    onClick={() => setDeletemodal(false)}
                                >
                                    No
                                </button>

                                <button
                                    className="px-6 py-2 rounded bg-red-600 text-white"
                                    onClick={() => handleDelete(false)}
                                >
                                    Yes
                                </button>
                            </div>

                        </div>
                    }
                />

                <ReusableModal
                    open={forceDeleteModal}
                    onCancel={() => setForceDeleteModal(false)}
                    title="Network Contains Tokens"
                    showFooter={false}
                    description={"Are you sure you want to delete this network?"}
                    extraContent={
                        <div className="text-center">

                            <p className="text-gray-300 mb-3">
                                This network contains the following tokens:
                            </p>

                            <p className="text-red-400 font-semibold mb-4">
                                {deleteTokens.join(", ")}
                            </p>

                            <p className="text-gray-300">
                                Deleting this network will also delete these tokens.
                                Do you want to continue?
                            </p>

                            <div className="flex justify-between gap-4 mt-6">

                                <button
                                    className="px-6 py-2 rounded primaty-bg text-black"
                                    onClick={() => setForceDeleteModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="px-6 py-2 rounded bg-red-600 text-white"
                                    onClick={() => handleDelete(true)}
                                >
                                    Delete Network & Tokens
                                </button>

                            </div>
                        </div>
                    }
                />
             
            </>
        </div>
    );
};

export default Network;
