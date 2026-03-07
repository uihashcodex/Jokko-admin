import { useState, useEffect } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableModal from "../reuseable/ReusableModal";
import TableHeader from "../reuseable/TableHeader";
import axios from "axios";
import { constant } from "../const";
import { message } from 'antd';
import theme from '../config/theme';
import debounce from "lodash.debounce";
import { useMemo } from "react";



const Assets = () => {

    const [originalData, setOriginalData] = useState([]);
    const [networkOptions, setNetworkOptions] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const columns = [
        { title: "S.no", dataIndex: "sno", key: "sno" },
        { title: "Token Name", dataIndex: "tokenName", key: "tokenName" },
        { title: "Token Symbol", dataIndex: "tokenSymbol", key: "tokenSymbol" },
        { title: "Token Decimals", dataIndex: "tokenDecimals", key: "tokenDecimals" },
        { title: "Contract Address", dataIndex: "contractAddress", key: "contractAddress" },
        { title: "Network Name", dataIndex: "networkName", key: "networkName" },
        { title: "Status", dataIndex: "status", key: "status" },
    ];

   
    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];


    const fields = [
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
        ,
        {
            label: "Status",
            name: "status",
            type: "select",
            options: statusOptions
        }

    ];
    const [filteredData, setFilteredData] = useState(originalData);
    const [open, setOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [page, setPage] = useState(1);
    const [messageApi, contextHolder] = message.useMessage();
    // const [select, setSelect] = useState(networkOptions);


    const modalFields = selectedAsset
        ? fields
        : fields.filter(f => f.name !== "status");

    const handleCreate = () => {
        setSelectedAsset(null);
        setOpen(true);
    };

    const handleUpdate = (record) => {
        setSelectedAsset(record);
        setOpen(true);
    };

    const [filters, setFilters] = useState({
        search: "",
        type: "",
        status: ""
    });


    const getToken = async () => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== "")
            );
            const response = await axios.post(
                `${constant.backend_url}/assets/get-all-tokens`,

                {
                    ...cleanFilters,
                    page: page,
                    limit: 10
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (response.data?.success) {

                const docs = response.data.result || [];
                setTotalUsers(response.data.total);
                const formattedData = docs.map((item, index) => ({
                    // const formattedData = response.data.result.map((item, index) => ({

                    id: item?._id,
                    sno: index + 1,
                    tokenName: item?.tokenName,
                    tokenSymbol: item?.tokenSymbol,
                    contractAddress: item?.contractAddress || "***",
                    tokenDecimals: item?.decimals,
                    status: item?.verifyStatus == true ? "active" : "inactive",
                    
                    networkName: item?.network_id?.networkName,
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
    }, [page, filters]);


    const updateFilter = (key, value) => {

        if (key === "status") {
            value = value === "active" ? "true" : value === "inactive" ? "false" : "";
        }

        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

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
                        tokenName: values?.tokenName,
                        tokenSymbol: values?.tokenSymbol,
                        decimals: Number(values?.tokenDecimals), 
                        contractAddress: values?.contractAddress,
                        network_id: values?.network_id,
                        verifyStatus: values?.status === "active"   // ⭐ ADD THIS

                    },

                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                        validateStatus: () => true
                    }

                );
                console.log(values, "asdfsafdf");

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

      const debouncedSearch = useMemo(
        () =>
          debounce((value) => {
            updateFilter("search", value);
          }, 800),
        []
      );
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
                onSearch={(value) => debouncedSearch(value)}
                onTypeChange={(value) => updateFilter("type", value)}
                onVerifyChange={(value) => updateFilter("status", value)}
            />

            <ReusableTable
                columns={columns}
                data={filteredData}
                onUpdate={handleUpdate}
                pageSize={10}
            />

            <ReusableModal
                key={networkOptions.length}
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                title={selectedAsset ? "Update Asset" : "Create Asset"}
                fields={modalFields}
                initialValues={selectedAsset}
                maskClosable={false}
            />
        </>
    );
};

export default Assets;
