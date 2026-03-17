import { useState, useEffect } from "react";
import { Button } from "antd";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableDrawer from "../reuseable/ReusableDreawer";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import axios from "axios";
import theme from '../config/theme';
import { constant } from "../const";


const EmailTemplateManagementnew = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState("template1");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // ---------------- TABLE COLUMNS ----------------

  const columns = [
    { title: "Event Key", dataIndex: "event_key" },
    { title: "Subject", dataIndex: "subject" },
    {
      title: "Body", dataIndex: "body", render: (to) => {
        if (!to) return "-";
        return `${to.slice(0, 20)}...`;
      } },
    { title: "Status", dataIndex: "status", }
  ];

  // ---------------- MODAL FIELDS ----------------


  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "align",
    "list",
    "bullet",
    "link"
  ];

  const fields = [
    {
      label: "Event Key",
      name: "event_key",
      type: "text"
    },
    {
      name: "subject",
      label: "Email Subject",
      type: "text",
      rules: [{ required: true, message: "Subject is required" }]
    },
    {
      name: "body",
      label: "Email Body",
      type: "editor",
      span: 24,
      modules: modules,
      formats: formats
    },
    {
      label: "Active",
      name: "is_active",
      type: "switch"
    }
  ];



  const templates = {
    template1: `
<div style="font-family:Arial, sans-serif;">
  
  <div style="max-width:600px;margin:auto;">
<div style="background:#122f2a;border:1px solid #ddd;color:#fff">
    <div style="height:10px;background:#c9f07b"></div>

    <div style="text-align:center;padding:30px">
      <img src="/img/logo.png" style="width:80px;margin-bottom:10px"/>
      <h1 style="color:#fff;margin:10px 0;" class="text-lg font-bold">
        {{subject}}
      </h1>
    </div>

<div style="padding:30px;color:#fff;line-height:1.6">

<div style="margin-bottom:10px; text-align:center;">
  {{content}}
</div>
      <p>Thank You,</p>

      <p>
        Jokko Wallet

      </p>

    </div>

  </div>
    <div style="text-align:center;color:#000;font-size:13px;margin-top:2px;background:#c9f07b;padding:10px">
  Copyright © 2026 | Jokko Wallet <br/>
  </div>


  </div>
</div>
`,

    template2: `
        <div style="font-family:Arial, sans-serif;background:#f4f4f4;padding:40px 0">

  <div style="max-width:600px;margin:auto">

    <div style="background:#c9f07b;height:120px;text-align:center">
      <div style="padding-top:35px">
      </div>
    </div>

    <div style="
        background:white;
        margin:-60px auto 0;
        padding:40px;
        border-radius:4px;
        box-shadow:0 2px 8px rgba(0,0,0,0.1);
        text-align:center;
        max-width:500px;
      ">
      <div class="flex justify-center">
      <img src="/img/logo.png" style="width:100px;margin-bottom:10px"/>
</div>
      <h2 style="margin-bottom:15px;color:#333">{{subject}}</h2>


      <div style="text-align:left;color:#666;font-size:14px;line-height:1.6">
        {{content}}
      </div>

      <p style="margin-top:25px;color:#666">
        If you have any questions, just reply to this email—we're always happy
        to help out.
      </p>

      <p style="margin-top:15px;color:#333">
        The Jokko Wallet Team
      </p>

    </div>

    <div style="text-align:center;color:#888;font-size:12px;margin-top:25px">
      Dashboard · Billing · Help <br/><br/>
      If these emails get annoying, feel free to 
      <a href="#" style="color:#888">unsubscribe</a>.<br/><br/>
      Jokko Wallet
    </div>

  </div>

</div>
`,
    template3: `
<div style="font-family:Arial, sans-serif;background:#f5f5f5;padding:50px 0">

  <div style="
      max-width:600px;
      margin:auto;
      background:white;
      border-radius:20px;
      border:1px solid #ddd;
      padding:40px;
      text-align:center;
  ">

    <div style="margin-bottom:20px" class="flex justify-center">
      <img src="/img/logo-sm.png"
           style="width:70px;height:70px;border-radius:12px"/>
    </div>

    <h2 style="font-size:28px;margin-bottom:10px;color:#222">
     {{subject}}
    </h2>



    <div style="color:#666;font-size:15px;line-height:1.6;margin-top:20px;text-align:left">
      {{content}}
    </div>



    <div style="
        background:#f2f2f2;
        border-radius:12px;
        padding:20px;
        margin-top:30px;
        font-size:14px;
        color:#777;
    ">
Copyright © 2026 | Jokko Wallet
    </div>

  </div>

</div>
`,
}



  // ---------------- GET EMAIL TEMPLATES ----------------

  const getEmailTemplates = async () => {

    const startTime = Date.now();

    try {

      setLoading(true);

      const response = await axios.get(
        `${constant.backend_url}/admin/get-emailtemplates`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      if (response.data?.success) {

        const docs = response.data.result || [];

        const formattedData = docs.map((item) => ({
          id: item._id,
          event_key: item.event_key,
          subject: item.subject,
          body: item.body,
          is_active: item.is_active,
          status: item.is_active ? "Active" : "Inactive"
        }));

        setOriginalData(formattedData);
        setTotal(formattedData.length);
      }

    } catch (error) {

      console.log(error);
      setOriginalData([]);

    } finally {

      const elapsed = Date.now() - startTime;
      const minTime = 500;

      setTimeout(() => {
        setLoading(false);
      }, Math.max(minTime - elapsed, 0));
    }
  };

  useEffect(() => {
    getEmailTemplates();
  }, []);

  // ---------------- UPDATE CLICK ----------------

  const handleUpdate = (record) => {
    setSelectedRow(record);
    setDrawerOpen(true);
  };

  // ---------------- UPDATE SUBMIT ----------------

  const handleSubmit = async (values) => {

    console.log("Updated values:", values);

    setModalOpen(false);

    // optional API call here
  };

  const previewHtml =
    templates[selectedDesign]
      ?.replace(/{{subject}}/g, selectedRow?.subject || "Email Subject")
      ?.replace(/{{content}}/g, selectedRow?.body || "Email content here...");

  return (
    <div>

      <TableHeader
        data={originalData}
        showCreateButton={false}
      />

      <ReusableTable
        columns={columns}
        data={originalData}
        loading={loading}
        total={total}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        actionType="update"
        onUpdate={handleUpdate}
      />

      <ReusableDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Update Email Template"
        fields={fields}
        initialValues={selectedRow}
        onSubmit={handleSubmit}
        width={"85%"}
        additionalContent={
          <div className=" mt-6">

            <h3 className="text-white mb-3">Select Template Design</h3>

            <div className="display-1">
            <div className="flex gap-3">

              {["template1", "template2", "template3"].map((design) => (
                <div
                  key={design}
                  className={`template-card ${selectedDesign === design ? "active" : ""}`}
                  onClick={() => setSelectedDesign(design)}
                >
                  <img
                    src={`/img/email-tem-${design.replace("template", "")}.png`}
                    className="template-img"
                  />
                  <p className="white">{design}</p>
                </div>
              ))}

            </div>

            <div className="mt-4">
              <Button
                className="preview-btn"
                onClick={() => setPreviewOpen(true)}
                                style={{ background: theme.sidebarSettings.activeBgColor }}
              >
                Preview
              </Button>
              </div>
            </div>

          </div>
        }
      />

      {previewOpen && (
        <ReusableModal
          open={previewOpen}
          onCancel={() => setPreviewOpen(false)}
          title="Template Preview"
          showFooter={false}
          extraContent={
            <div
              style={{
                background: "#fff",
                padding: "20px",
                maxHeight: "70vh",
                overflow: "auto"
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          }
        />
      )}

    </div>
  );
};

export default EmailTemplateManagementnew;