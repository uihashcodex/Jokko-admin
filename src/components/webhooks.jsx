import  { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import theme from '../config/theme';



const Webhook = () => {
    const [visibleRow, setVisibleRow] = useState(null);

  const originalData = [
    {
      id: 1,
      name: "webhook 1",
          webtype: "webhook",
          weburl: "https://google.com",
          status: "active",
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
         <div
                            className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center"
                            style={{
                                backgroundImage: `url(${theme.dashboardheaderimg.image})`,
                                height: theme.dashboardheaderimg.height
                            }}
                        >
                            <div className="display-3 w-full">
                                <h1 className="text-white p-7 font-bold text-2xl">
                                    webHook                </h1>
                            </div>
                        </div>
        <TableHeader
          data={originalData}
          showCreateButton={false}
        />
        <ReusableTable 
        columns={columns}
        data={originalData}
              actionType={"update "}
        />
    </div>
  )
}

export default Webhook;