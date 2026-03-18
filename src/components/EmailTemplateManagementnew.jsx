import { useState, useEffect } from "react";
import { Button, Switch } from "antd";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableDrawer from "../reuseable/ReusableDreawer";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import axios from "axios";
import theme from '../config/theme';
import { constant } from "../const";
import {message } from 'antd';


const EmailTemplateManagementnew = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [selectedDesign, setSelectedDesign] = useState("template1");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDesign, setSelectedDesign] = useState("template1"); // local
  const [globalDesign, setGlobalDesign] = useState("template1"); // default
  const [designModalOpen, setDesignModalOpen] = useState(false);
  const [pendingDesign, setPendingDesign] = useState(null);
  const [liveBody, setLiveBody] = useState("");
  const [liveSubject, setLiveSubject] = useState("");
  const [isActive, setIsActive] = useState(false);
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
      rules: [{ required: true, message: "Subject is required" }],
        onChange: (e) => setLiveSubject(e.target.value) // ✅

    },
    {
      name: "body",
      label: "Email Body",
      type: "editor",
      span: 24,
      modules: modules,
      formats: formats,
      onChange: (val) => setLiveBody(val) // ✅ CORRECT

    },
    // {
    //   label: "Active",
    //   name: "is_active",
    //   type: "switch"
    // }
  ];


  useEffect(() => {
    const saved = localStorage.getItem("defaultTemplate");
    if (saved) {
      setGlobalDesign(saved);
      setSelectedDesign(saved); // default apply
    }
  }, []);

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
        template4: `
<div style="font-family:Arial, sans-serif;background:#f4f4f4;padding:40px 0">

  <div style="max-width:600px;margin:auto;background:white;border:1px solid #ddd">

    <div style="
        background:#095246;
        color:white;
        text-align:center;
        padding:30px 20px;
        font-size:22px;
        font-weight:600;
      ">
      Responsive Email Template
    </div>

    <div style="padding:35px;color:#444;font-size:15px;line-height:1.7">

      <p>Hello {{name}},</p>

      <p>
       ******************************************************************
       <br/>
       *********************************************************
      </p>

     <p>
       ******************************************************************
       <br/>
       *********************************************************
      </p>


      <div>
        {{content}}
      </div>


    </div>

    <div style="
        background:#2f2f2f;
        color:#ccc;
        text-align:center;
        padding:20px;
        font-size:13px;
      ">
      Copyright © 2024 | Your brand name
    </div>

  </div>

</div>
`,
        template5: `
<div style="font-family:Arial, sans-serif;background:#1a1a1a;padding:40px 0">

  <div style="max-width:600px;margin:auto;background:#ffffff">

    <!-- logo -->
     <div style="display:flex;align-items:center;justify-content:center;padding-top:20px">
      <div style="width:80px;height:80px;">
        <img src="/img/logo-sm.png" style="width:40px"/>
      </div>
    </div>

    <!-- title -->
    <div style="padding:0 40px">
      <h1 style="font-size:32px;color:#111;margin-bottom:20px">
        {{subject}}
      </h1>

      <!-- content -->
      <div style="color:#555;font-size:15px;line-height:1.6">
        {{content}}
      </div>



    </div>

  </div>

  <!-- footer -->
  <div style="text-align:center;color:#aaa;margin-top:40px;font-size:13px">

    <p>Want updates through more platforms?</p>

    <div style="margin:15px 0">
      <span style="margin:0 8px">Twitter</span>
      <span style="margin:0 8px">Facebook</span>
      <span style="margin:0 8px">YouTube</span>
      <span style="margin:0 8px">Instagram</span>
    </div>


    <p>
      Unsubscribe • Privacy policy • Contact us
    </p>

  </div>

</div>
`,
        template6: `
<div style="font-family:Arial, sans-serif;background:#f2f2f2;padding:40px 0">

  <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden">

    <!-- header -->
    <div style="background:#122f2a;padding:25px">
      <img src="/img/logo-sm.png" style="width:40px"/>
    </div>

    <!-- content -->
    <div style="padding:40px">

      <h1 style="color:#000;font-size:28px;margin-bottom:20px">
        {{subject}}
      </h1>

      <div style="color:#555;font-size:16px;line-height:1.6;margin-bottom:25px">
        {{content}}
      </div>

      <p style="color:#666;font-size:14px">
        If you did not request a password reset, you can safely ignore this email.
      </p>

    </div>

  </div>

  <!-- footer -->
  <div style="text-align:center;color:#888;font-size:12px;margin-top:25px">
    Flash is a webtool that is a free open source JavaScript framework
    that can be accessed from a browser or mobile device in a Web browser.
    <br/><br/>
    © 2022 Flash Inc. All Rights Reserved
  </div>

</div>
`,

    };



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
          design: item.design, 
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

  // const handleUpdate = (record) => {
  //   setSelectedRow(record);
  //   setDrawerOpen(true);
  // };

  const handleUpdate = (record) => {
    setSelectedRow(record);
    setSelectedDesign(record.design || globalDesign);
    setIsActive(record.is_active ?? false); // ✅
    setDrawerOpen(true);
  };

  // ---------------- UPDATE SUBMIT ----------------

  const handleSubmit = async (values) => {

    const startTime = Date.now();

    try {

      setLoading(true);

      if (selectedRow) {


        const payload = {
          event_key: selectedRow.event_key,
          subject: values.subject,
          body: values.body,
          is_active: isActive
                        };
        const isSame =
          payload.subject === selectedRow.subject &&
          payload.body === selectedRow.body &&
          payload.is_active === selectedRow.is_active;

        if (isSame) {
          message.error("No changes detected");
          return;
        }
      }

      const response = await axios.post(
        `${constant.backend_url}/admin/edit-email-template`,
        {
          event_key: selectedRow?.event_key,
          subject: values?.subject,
          body: values?.body,
          design: selectedDesign,
          is_active: isActive
                },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      if (response.data?.success) {

        message.success(response.data.message);
        getEmailTemplates();
        setDrawerOpen(false);
      }

    } catch (error) {

      console.log(error);

    } finally {

      const elapsed = Date.now() - startTime;
      const minTime = 500;

      setTimeout(() => {
        setLoading(false);
      }, Math.max(minTime - elapsed, 0));
    }

  

  };

  useEffect(() => {
    if (drawerOpen && selectedRow) {
      setLiveBody(selectedRow.body || "");
      setLiveSubject(selectedRow.subject || "");
    }
  }, [drawerOpen, selectedRow]);

  const previewHtml =
    templates[selectedDesign]
      ?.replace(/{{subject}}/g, liveSubject || selectedRow?.subject || "Email Subject")
      ?.replace(/{{content}}/g, liveBody || selectedRow?.body || "Email content here...");

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
          // <div className=" mt-6">

          //   <h3 className="text-white mb-3">Select Template Design</h3>

          //   <div className="display-1">
          //   <div className="flex gap-3">

          //     {["template1", "template2", "template3"].map((design) => (
          //       <div
          //         key={design}
          //         className={`template-card ${selectedDesign === design ? "active" : ""}`}
          //         onClick={() => setSelectedDesign(design)}
          //       >
          //         <img
          //           src={`/img/email-tem-${design.replace("template", "")}.png`}
          //           className="template-img"
          //         />
          //         <p className="white">{design}</p>
          //       </div>
          //     ))}

          //   </div>

          //   <div className="mt-4">
          //     <Button
          //       className="preview-btn"
          //       onClick={() => setPreviewOpen(true)}
          //                       style={{ background: theme.sidebarSettings.activeBgColor }}
          //     >
          //       Preview
          //     </Button>
          //     </div>
          //   </div>

          // </div>
          <div className="mt-6">
            <h3 className="text-white mb-2">Template Preview</h3>

            {/* ✅ LIVE TEMPLATE PREVIEW */}
            <div
              style={{
                background: "transprent", // match email bg
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  width: "600px", // 🔥 FIXED WIDTH
                  background: "#fff"
                }}
              dangerouslySetInnerHTML={{
                __html: templates[selectedDesign]
                  ?.replace(/{{subject}}/g, liveSubject || selectedRow?.subject || "Email Subject")
                  ?.replace(/{{content}}/g, liveBody || selectedRow?.body || "Email content here...")
              }}
            />
            </div>

            <div className="text-center">
            <Button
              onClick={() => setDesignModalOpen(true)}
              style={{ background: theme.sidebarSettings.activeBgColor }}
            >
              Change Template
            </Button>
            </div>

            <div className="mt-6">
              <label className="text-white mr-3">Active</label>
              {/* <Switch
                checked={selectedRow?.is_active ?? false}
                                onChange={(val) => {
                  setSelectedRow((prev) => ({
                    ...prev,
                    is_active: val
                  }));
                }}
              /> */}
              <Switch
                checked={isActive}
                onChange={(val) => setIsActive(val)}
              />
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

      <ReusableModal
        open={designModalOpen}
        onCancel={() => setDesignModalOpen(false)}
        title="Select Template Design"
        showFooter={false}
        description={" "}
        extraContent={
          
          <>
        
          <div className="flex gap-3 flex-wrap justify-center">

              {["template1", "template2", "template3", "template4", "template5", "template6"].filter((design) => design !== selectedDesign) // 🔥 HIDE SELECTED
                .map((design) => (

              <div
                key={design}
                className="template-card "
                onClick={() => setPendingDesign(design)}
              >
                <img
                  src={`/img/email-tem-${design.replace("template", "")}.png`}
                  className="template-img"
                />
                <p className="white">{design}</p>
              </div>
            ))}

            {/* confirm section */}
            {pendingDesign && (
              <div className="mt-4 text-center w-full">
                <p className="white">Use this template?</p>

                <div className="flex justify-center gap-2 mt-2">
                  <Button onClick={() => setPendingDesign(null)}>Cancel</Button>

                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedDesign(pendingDesign);
                      setDesignModalOpen(false);
                      setPendingDesign(null);
                    }}
                    style={{ background: theme.sidebarSettings.activeBgColor }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
          </>
        }
      />

    </div>
  );
};

export default EmailTemplateManagementnew;