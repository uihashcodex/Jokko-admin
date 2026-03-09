import  { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";


const Webhook = () => {

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
    { title: "ID", dataIndex: "id", key: "id" },
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "web Type", dataIndex: "webtype", key: "webtype" },
      { title: "web Url", dataIndex: "weburl", key: "weburl" },
      { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div>
        <TableHeader
          data={originalData}
          showCreateButton={false}
        />
        <ReusableTable 
        columns={columns}
        data={originalData}
        actionType={"update"}
        />
    </div>
  )
}

export default Webhook;