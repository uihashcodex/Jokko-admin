import  { useState } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import ReusableTable from "../reuseable/ReusableTable";


const Viewuser = () => {
    const [visibleRow, setVisibleRow] = useState(null);

  const originalData = [
    {
      id: 1,
      sno: 1,
      user_id: "63fe747765f9696642b11a9",
      walletName: "wallet 1",
      secretPhrase: "Wkjdsnjdbcjdjc+ndsjkndkjnijduinjdhbvg%csgbgsvjdkhjdhjdgdhgfghf",
      checkStatus: true
    }
  ];

  const columns = [
    { title: "S.no", dataIndex: "sno", key: "sno" },
    { title: "User Id", dataIndex: "user_id", key: "user_id" },
    { title: "Wallet Name", dataIndex: "walletName", key: "walletName" },

    {
      title: "Secret Phrase",
      dataIndex: "secretPhrase",
      key: "secretPhrase",
      render: (text, record) => (
        <span>
          {visibleRow === record.id ? text : "************"}
          <span
            style={{ marginLeft: 10, cursor: "pointer" }}
            onClick={() =>
              setVisibleRow(visibleRow === record.id ? null : record.id)
            }
          >
            {visibleRow === record.id ? (
              <EyeInvisibleOutlined />
            ) : (
              <EyeOutlined />
            )}
          </span>
        </span>
      ),
    },
    {
      title: "Check Status",
      dataIndex: "checkStatus",
      key: "checkStatus",
      render: (value) =>
        value ? (
          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
        ) : (
          <span style={{ color: "red", fontWeight: "bold" }}>Inactive</span>
        ),
    },
  ];

  return (
    <div>
        <ReusableTable 
        columns={columns}
        data={originalData}
        />
    </div>
  )
}

export default Viewuser