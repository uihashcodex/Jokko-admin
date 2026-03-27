import { useState, useEffect } from "react";
import { Button, Switch } from "antd";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableDrawer from "../reuseable/ReusableDreawer";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import axios from "axios";
import theme from '../config/theme';
import { constant } from "../const";
import { message } from 'antd';


const EmailTemplateManagementnew = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deletemodal, setDeletemodal] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDesign, setSelectedDesign] = useState("template1"); // local (used for update)
  const [globalDesign, setGlobalDesign] = useState("template1"); // default
  const [designModalOpen, setDesignModalOpen] = useState(false);
  const [pendingDesign, setPendingDesign] = useState(null);
  const [liveBody, setLiveBody] = useState("");
  const [liveSubject, setLiveSubject] = useState("");
  const [isActive, setIsActive] = useState(false);

  // ---- CREATE DRAWER state ----
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [liveCreateBody, setLiveCreateBody] = useState("");
  const [liveCreateSubject, setLiveCreateSubject] = useState("");
  const [createDesign, setCreateDesign] = useState("template1");
  const [isCreateActive, setIsCreateActive] = useState(true);
  const [createDesignModalOpen, setCreateDesignModalOpen] = useState(false);
  const [pendingCreateDesign, setPendingCreateDesign] = useState(null);
  // ---------------- TABLE COLUMNS ----------------

  const columns = [
    { title: "Event Key", dataIndex: "event_key" },
    { title: "Subject", dataIndex: "subject" },
    {
      title: "Body", dataIndex: "body", render: (to) => {
        if (!to) return "-";
        return `${to.slice(0, 20)}...`;
      }
    },
    { title: "Status", dataIndex: "status", }
  ];

  // ---------------- MODAL FIELDS ----------------


  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
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
    "link",
    "indent",     // ✅ REQUIRED for list
    "direction",  // ✅ optional
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
      // type: "textarea",
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


  const createFields = [
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
      onChange: (e) => setLiveCreateSubject(e.target.value)
    },
    {
      name: "body",
      label: "Email Body",
      type: "editor", // ✅ EDITOR for CREATE (matches update)
      span: 24,
      modules: modules,
      formats: formats,
      onChange: (val) => setLiveCreateBody(val)
    }
  ];

  const updateFields = [
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
      onChange: (e) => setLiveSubject(e.target.value)
    },
    {
      name: "body",
      label: "Email Body",
      type: "editor", // ✅ EDITOR for UPDATE
      span: 24,
      modules: modules,
      formats: formats,
      onChange: (val) => setLiveBody(val)
    }
  ];


  useEffect(() => {
    const saved = localStorage.getItem("defaultTemplate");
    if (saved) {
      setGlobalDesign(saved);
      setSelectedDesign(saved); // default apply
    }
  }, []);

  // const templates = {
  //   template1: `
  // <div style="font-family:Arial, sans-serif;">
  // <div style="padding:20px 10px;">

  // <div style="max-width:600px;width:100%;margin:0 auto;background:#122f2a;color:#fff;border-radius:6px;overflow:hidden">

  // <div style="height:6px;background:#c9f07b"></div>

  // <div style="text-align:center;padding:20px">
  // <img src="/img/logo.png" style="width:60px;margin-bottom:8px"/>

  // <h2 style="margin:5px 0;">{{subject}}</h2>
  // </div>

  // <div style="padding:20px;font-size:13px;line-height:1.5;">
  // {{content}}
  // <p style="margin-top:10px">Thank You,<br/>Jokko Wallet</p>
  // </div>
  // <div style="text-align:center;background:#c9f07b;font-size:12px;padding:8px;color:#000;">
  // © 2026 Jokko Wallet
  // </div>
  // </div>
  // </div>
  // </div>
  // `,

  //   template2: `

  //         <div style="font-family:Arial, sans-serif;background:#f4f4f4;padding:20px 0">
  //           <div style="max-width:600px;width:100%;margin:0 auto;">


  //     <div style="background:#c9f07b;height:120px;text-align:center">
  //       <div style="padding-top:35px">
  //       </div>
  //     </div>

  //     <div style="
  //         background:white;
  //         margin:-60px auto 0;
  //         padding:40px;
  //         border-radius:4px;
  //         box-shadow:0 2px 8px rgba(0,0,0,0.1);
  //         text-align:center;
  //         max-width:500px;
  //       ">
  //       <div style="display:flex,justify-content:flex-start,margin-bottom:20px">
  //       <img src="/img/logo.png" style="width:100px;margin-bottom:10px"/>
  // </div>
  //       <h2 style="margin-bottom:15px;color:#333">{{subject}}</h2>


  //       <div style="text-align:left;color:#666;font-size:14px;line-height:1.6">
  //         {{content}}
  //       </div>



  //     </div>

  //     <div style="text-align:center;color:#888;font-size:12px;margin-top:25px">
  //       Dashboard · Billing · Help <br/><br/>
  //       If these emails get annoying, feel free to 
  //       <a href="#" style="color:#888">unsubscribe</a>.<br/><br/>
  //       Jokko Wallet
  //     </div>

  //   </div>

  // </div>
  // `,
  //   template3: `
  // <div style="font-family:Arial, sans-serif;">
  // <div style="padding:20px 10px;">

  //   <div style="
  //     max-width:600px;width:100%;margin:0 auto;
  //       background:white;
  //       border-radius:20px;
  //       border:1px solid #ddd;
  //       padding:20px;
  //       text-align:center;
  //   ">

  //     <div style="margin-bottom:20px" class="flex justify-center">
  //       <img src="/img/logo-sm.png"
  //            style="width:70px;height:70px;border-radius:12px"/>
  //     </div>

  //     <h2 style="font-size:28px;margin-bottom:10px;color:#222">
  //      {{subject}}
  //     </h2>



  //     <div style="color:#666;font-size:15px;line-height:1.6;margin-top:20px;text-align:left">
  //       {{content}}
  //     </div>



  //     <div style="
  //         background:#f2f2f2;
  //         border-radius:12px;
  //         padding:20px;
  //         margin-top:30px;
  //         font-size:14px;
  //         color:#777;
  //     ">
  // Copyright © 2026 | Jokko Wallet
  //     </div>

  //   </div>
  //   </div>

  // </div>
  // `,
  //   template4: `
  // <div style="font-family:Arial, sans-serif;">
  // <div style="padding:20px 10px;">

  //   <div style="max-width:600px;width:100%;margin:0 auto;background:white;border:1px solid #ddd">

  //     <div style="
  //         background:#095246;
  //         color:white;
  //         text-align:center;
  //         padding:30px 20px;
  //         font-size:22px;
  //         font-weight:600;
  //       ">
  // {{subject}}    </div>

  //     <div style="padding:35px;color:#444;font-size:15px;line-height:1.7">
  // <div class="flex justify-center">
  //       <img src="/img/logo.png" style="width:100px;margin-bottom:10px"/>
  // </div>
  //       <p>Hello {{name}},</p>



  //       <div>
  //         {{content}}
  //       </div>


  //     </div>

  //     <div style="
  //         background:#2f2f2f;
  //         color:#ccc;
  //         text-align:center;
  //         padding:20px;
  //         font-size:13px;
  //       ">
  //       Copyright © 2024 | Jokko Wallet
  //     </div>

  //   </div>
  //   </div>

  // </div>
  // `,
  //   template5: `
  // <div style="margin:0;font-family:Arial, sans-serif;">

  // <div style="padding:20px 10px;">

  //     <div style="
  // max-width:600px;width:100%;margin:0 auto;
  //   background:#ffffff;
  //   border-radius:6px;
  //   overflow:hidden;
  //   border:1px solid #eee;
  // ">
  //             <div style="
  //                 background:#1a1a1a;
  //                 text-align:center;
  //                 padding:10px;
  //                 color:#fff;
  //                 font-size:12px;
  //               ">
  //             </div>
  //             <!-- Logo -->
  //             <div style="padding:15px 20px;">
  //       <img src="/img/logo-sm.png" style="width:40px"/>
  //             </div>

  //             <!-- Title -->
  //             <div style="padding:0 20px;">
  //                 <h2 style="margin:0;font-size:20px;color:#111;">
  //                     {{subject}}
  //                 </h2>
  //             </div>




  //             <div style="color:#555;font-size:15px;line-height:1.6;padding:0 20px;margin-top: 20px;">
  //                 {{content}}
  //             </div>
  //             <!-- Footer Content -->
  //             <div style="padding:10px 20px;color:#555;font-size:12px;">
  //                 <p><b>Regards</b><br />Team Jokko wallet</p>
  //             </div>

  //             <!-- Bottom Footer -->
  //             <div style="
  //         background:#1a1a1a;
  //         text-align:center;
  //         padding:10px;
  //         color:#fff;
  //         font-size:12px;
  //       ">
  //                 <p>Want updates through more platforms?</p>

  //                 <div style="margin:15px 0">
  //                     <span style="margin:0 8px">Twitter</span>
  //                     <span style="margin:0 8px">Facebook</span>
  //                     <span style="margin:0 8px">YouTube</span>
  //                     <span style="margin:0 8px">Instagram</span>
  //                 </div>


  //                 <p>
  //                     Unsubscribe • Privacy policy • Contact us
  //                 </p>
  //             </div>

  //         </div>

  //     </div>

  // </div>
  // `,
  //   template6: `

  // <div style="font-family:Arial, sans-serif;">
  // <div style="padding:20px 10px;">

  //    <div style="max-width:600px;width:100%;margin:0 auto;background:white;border-radius:8px;overflow:hidden;margin-top:10px;margin-bottom:10px">

  //     <!-- header -->
  //      <div style="padding:15px 20px;">
  //       <img src="/img/logo-sm.png" style="width:40px"/>
  //             </div>

  //     <!-- content -->
  //     <div style="padding:40px">

  //       <h1 style="color:#000;font-size:28px;margin-bottom:20px">
  //         {{subject}}
  //       </h1>

  //       <div style="color:#555;font-size:16px;line-height:1.6;margin-bottom:25px">
  //         {{content}}
  //       </div>

  //     </div>
  //   <!-- footer -->
  //   <div style="text-align:center;color:#888;font-size:12px;margin-top:5px;background:#f2f2f2;padding-top:10px">
  //     © 2022 Jokko Wallet Inc. All Rights Reserved
  //   </div>
  //   </div>
  //   </div>
  // </div>
  // `,

  // };



  // ---------------- GET EMAIL TEMPLATES ----------------


  const [designTemplates, setDesignTemplates] = useState([]);

  const fetchDesignTemplates = async () => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/templates`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        setDesignTemplates(res.data.result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDesignTemplates();
  }, []);


  useEffect(() => {
    if (designTemplates.length > 0) {
      const defaultTemp = designTemplates.find(t => t.isDefault);

      if (defaultTemp) {
        setGlobalDesign(defaultTemp.template_name);
      }
    }
  }, [designTemplates]);

  const getEmailTemplates = async () => {

    const startTime = Date.now();

    try {

      setLoading(true);

      const response = await axios.get(
        `${constant.backend_url}/admin/get-emailcontent`,
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
          design: item.template_name,
          is_active: item.is_active,
          template_name: item.template_name,
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
    setSelectedDesign(record.design ? record.design : globalDesign);
    setIsActive(record.is_active ?? false); // ✅
    setDrawerOpen(true);
  };

  // ---------------- UPDATE SUBMIT ----------------


  const handleCreate = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/add-emailcontent`,
        {
          event_key: values.event_key,
          subject: values.subject,
          body: values.body,
          template_name: createDesign || globalDesign,
          is_active: isCreateActive
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        message.success(res.data.message || "Created successfully");
        setCreateDrawerOpen(false);
        setLiveCreateBody("");
        setLiveCreateSubject("");
        getEmailTemplates();
      } else {
        message.warning(res.data.message || "Create failed");
      }

    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {

    const startTime = Date.now();

    try {

      setLoading(true);

      if (selectedRow) {


        const payload = {
          event_key: selectedRow.event_key,
          subject: values.subject,
          body: values.body,
          template_name: selectedDesign,
          is_active: isActive
        };
        const isSame =
          payload.subject === selectedRow.subject &&
          payload.body === selectedRow.body &&
          payload.is_active === selectedRow.is_active &&
          selectedDesign === selectedRow.template_name
        if (isSame) {
          message.error("No changes detected");
          return;
        }
      }

      const response = await axios.post(
        `${constant.backend_url}/admin/edit-emailcontent`,
        {
          event_key: selectedRow?.event_key,
          subject: values?.subject,
          body: values?.body,
          template_name: selectedDesign,
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

  // Reset create drawer state when it opens
  useEffect(() => {
    if (createDrawerOpen) {
      setLiveCreateBody("");
      setLiveCreateSubject("");
      setCreateDesign(globalDesign);
      setIsCreateActive(true);
    }
  }, [createDrawerOpen]);



  const formatBody = (raw) =>
    (raw || "")
      .replace(/<h1>/g, '<h1 style="font-size:26px;font-weight:bold;margin:10px 0;">')
      .replace(/<h2>/g, '<h2 style="font-size:22px;font-weight:bold;margin:10px 0;">')
      .replace(/<h3>/g, '<h3 style="font-size:18px;font-weight:bold;margin:10px 0;">')
      .replace(/class="ql-align-center"/g, 'style="text-align:center;"')
      .replace(/class="ql-align-right"/g, 'style="text-align:right;"')
      .replace(/class="ql-align-justify"/g, 'style="text-align:justify;"')
      .replace(/<ul>/g, '<ul style="padding-left:20px;margin:10px 0;list-style-type:disc;list-style-position:inside;">')
      .replace(/<ol>/g, '<ol style="padding-left:0;margin:10px 0;list-style-type:decimal;list-style-position:inside;">')
      .replace(/<li>/g, '<li style="margin-bottom:5px;">')
      .replace(/<p>/g, '<p style="margin:5px 0;">');

  const formattedContent = formatBody(liveBody || selectedRow?.body || "");
  const formattedCreateContent = formatBody(liveCreateBody);

  // --- UPDATE preview ---
  const activeDesign = selectedDesign || globalDesign;
  const selectedTemplateObj = designTemplates.find((t) => t.template_name === activeDesign);
  const previewHtml =
    selectedTemplateObj?.html
      ?.replace(/{{subject}}/g, liveSubject || selectedRow?.subject || "Email Subject")
      ?.replace(/{{content}}/g, formattedContent)
    || "<p>No template found</p>";

  // --- CREATE preview ---
  const createTemplateObj = designTemplates.find((t) => t.template_name === (createDesign || globalDesign));
  const createPreviewHtml =
    createTemplateObj?.html
      ?.replace(/{{subject}}/g, liveCreateSubject || "Email Subject")
      ?.replace(/{{content}}/g, formattedCreateContent)
    || "<p>No template found</p>";

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/delete-emailcontent`,
        {
          event_key: deleteRecord?.event_key, // ✅ IMPORTANT
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        message.success(res.data.message || "Deleted successfully");
        setDeletemodal(false);
        getEmailTemplates();
      } else {
        message.warning(res.data.message || "Delete failed");
      }

    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <TableHeader
        data={originalData}
        showCreateButton={true}
        onCreate={() => setCreateDrawerOpen(true)}
      />

      <ReusableTable
        columns={columns}
        data={originalData}
        loading={loading}
        total={total}
        currentPage={page}
        pageSize={10}
        onPageChange={(p) => setPage(p)}
        actionType={["update", "Remove"]}
        onUpdate={handleUpdate}
        onDelete={(record) => {
          setDeleteRecord(record);
          setDeletemodal(true);
        }}
      />

      <ReusableDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Update Email Template"
        fields={updateFields}
        initialValues={selectedRow}
        onSubmit={handleSubmit}
        width={"85%"}
        additionalContent={
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
                  __html: previewHtml || "",
                }}

              />
            </div>

            <div className="text-center">
              <h3 className="text-white mb-2">{selectedRow?.template_name}</h3>
              <Button
                onClick={() => setDesignModalOpen(true)}
                style={{ background: theme.sidebarSettings.activeBgColor }}
              >
                Change Template
              </Button>
            </div>

            <div className="mt-6">
              <label className="text-white mr-3">Active</label>

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

              {designTemplates
                .filter((t) => t.template_name !== selectedDesign)
                .map((template) => (

                  <div
                    key={template._id}
                    className="template-card upload-templatecard"
                    onClick={() => setPendingDesign(template.template_name)}
                    style={{
                      border:
                        pendingDesign === template.template_name
                          ? "2px solid #c9f07b"
                          : "2px solid transparent",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "0.2s"
                    }}
                  >
                    {/* <div
                      dangerouslySetInnerHTML={{
                        __html: template.html,
                      }}
                    /> */}

                    <div
                      style={{
                        width: "220px",
                        height: "180px",
                        overflow: "hidden",
                        borderRadius: "12px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "scale(0.4)",
                          transformOrigin: "top left",
                          width: "600px"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: template.html,
                        }}
                      />
                    </div>
                    <p>{template.template_name}</p>
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
                        setSelectedRow(prev => ({
                          ...prev,
                          design: pendingDesign
                        }));
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

      {/* ---- CREATE EMAIL DRAWER (same design as Update) ---- */}
      <ReusableDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Create Email Template"
        fields={createFields}
        initialValues={{}}
        onSubmit={handleCreate}
        width={"85%"}
        additionalContent={
          <div className="mt-6">
            <h3 className="text-white mb-2">Template Preview</h3>

            {/* LIVE PREVIEW */}
            <div
              style={{
                background: "transparent",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <div
                style={{ width: "600px", background: "#fff" }}
                dangerouslySetInnerHTML={{ __html: createPreviewHtml }}
              />
            </div>

            <div className="text-center">
              <Button
                onClick={() => setCreateDesignModalOpen(true)}
                style={{ background: theme.sidebarSettings.activeBgColor }}
              >
                Change Template
              </Button>
            </div>

            <div className="mt-6">
              <label className="text-white mr-3">Active</label>
              <Switch
                checked={isCreateActive}
                onChange={(val) => setIsCreateActive(val)}
              />
            </div>
          </div>
        }
      />

      {/* ---- CREATE TEMPLATE PICKER MODAL ---- */}
      <ReusableModal
        open={createDesignModalOpen}
        onCancel={() => setCreateDesignModalOpen(false)}
        title="Select Template Design"
        showFooter={false}
        description={" "}
        extraContent={
          <>
            <div className="flex gap-3 flex-wrap justify-center">
              {designTemplates
                .filter((t) => t.template_name !== createDesign)
                .map((template) => (
                  <div
                    key={template._id}
                    className="template-card upload-templatecard"
                    onClick={() => setPendingCreateDesign(template.template_name)}
                    style={{
                      border:
                        pendingCreateDesign === template.template_name
                          ? "2px solid #c9f07b"
                          : "2px solid transparent",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "0.2s"
                    }}
                  >
                    <div
                      style={{
                        width: "220px",
                        height: "180px",
                        overflow: "hidden",
                        borderRadius: "12px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "scale(0.4)",
                          transformOrigin: "top left",
                          width: "600px"
                        }}
                        dangerouslySetInnerHTML={{ __html: template.html }}
                      />
                    </div>
                    <p>{template.template_name}</p>
                  </div>
                ))}

              {pendingCreateDesign && (
                <div className="mt-4 text-center w-full">
                  <p className="white">Use this template?</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <Button onClick={() => setPendingCreateDesign(null)}>Cancel</Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setCreateDesign(pendingCreateDesign);
                        setCreateDesignModalOpen(false);
                        setPendingCreateDesign(null);
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


      <ReusableModal
        open={deletemodal}
        onCancel={() => setDeletemodal(false)}
        title="Delete Network"
        description={"Are you sure you want to delete this network?"}
        showFooter={false}
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
                onClick={handleDelete}
              >
                Yes
              </button>
            </div>

          </div>
        }
      />

    </div>
  );
};

export default EmailTemplateManagementnew;