import { useState, useEffect, useMemo } from "react";
import { Button, Switch } from "antd";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableDrawer from "../reuseable/ReusableDreawer";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import axios from "axios";
import debounce from "lodash.debounce";
import theme from "../config/theme";
import { constant } from "../const";
import { message } from "antd";

const EmailTemplateManagementnew = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deletemodal, setDeletemodal] = useState(false);

  // CHANGE THESE STATES
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [createDesign, setCreateDesign] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [globalDesign, setGlobalDesign] = useState("template1");
  const [designModalOpen, setDesignModalOpen] = useState(false);
  const [pendingDesign, setPendingDesign] = useState(null);
  const [liveBody, setLiveBody] = useState("");
  const [liveSubject, setLiveSubject] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [liveCreateBody, setLiveCreateBody] = useState("");
  const [liveCreateSubject, setLiveCreateSubject] = useState("");
  const [isCreateActive, setIsCreateActive] = useState(true);
  const [createDesignModalOpen, setCreateDesignModalOpen] = useState(false);
  const [pendingCreateDesign, setPendingCreateDesign] = useState(null);

  const [designTemplates, setDesignTemplates] = useState([]);

  const columns = [
    { title: "Event Key", dataIndex: "event_key" },
    { title: "Subject", dataIndex: "subject" },
    {
      title: "Body",
      dataIndex: "body",
      render: (body) => {
        if (!body) return "-";
        return `${body.slice(0, 20)}...`;
      },
    },
    { title: "Status", dataIndex: "status" },
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
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
    "indent",
    "direction",
  ];

  const createFields = [
    {
      label: "Event Key",
      name: "event_key",
      type: "text",
    },
    {
      name: "subject",
      label: "Email Subject",
      type: "text",
      rules: [{ required: true, message: "Subject is required" }],
      onChange: (e) => setLiveCreateSubject(e.target.value),
    },
    {
      name: "body",
      label: "Email Body",
      type: "editor",
      span: 24,
      modules,
      formats,
      onChange: (val) => setLiveCreateBody(val),
    },
  ];

  const updateFields = [
    {
      label: "Event Key",
      name: "event_key",
      type: "text",
      disabled: true,
    },
    {
      name: "subject",
      label: "Email Subject",
      type: "text",
      rules: [{ required: true, message: "Subject is required" }],
      onChange: (e) => setLiveSubject(e.target.value),
    },
    {
      name: "body",
      label: "Email Body",
      type: "editor",
      span: 24,
      modules,
      formats,
      onChange: (val) => setLiveBody(val),
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("defaultTemplate");
    if (saved) {
      setGlobalDesign(saved);
      setSelectedDesign(saved);
    }
  }, []);

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
        setDesignTemplates(res.data.result || []);
      } else {
        setDesignTemplates([]);
      }
    } catch (err) {
      console.error(err);
      setDesignTemplates([]);
    }
  };

  useEffect(() => {
    fetchDesignTemplates();
  }, []);

  // FETCH TEMPLATE DESIGN AS OBJECT ID + NAME
  useEffect(() => {
    if (designTemplates.length > 0) {
      const defaultTemp = designTemplates.find((t) => t.isDefault);

      if (defaultTemp) {
        setGlobalDesign(defaultTemp._id); // store ObjectId
        setSelectedDesign(defaultTemp._id);
      }
    }
  }, [designTemplates]);
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setPage(1);
        setSearch(value || "");
      }, 800),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleStatusFilter = (value) => {
    setPage(1);

    if (value === "active") {
      setStatusFilter("true");
    } else if (value === "inactive") {
      setStatusFilter("false");
    } else {
      setStatusFilter("");
    }
  };

  const formatEmailContent = (docs = []) =>
    docs.map((item) => ({
      id: item._id,
      event_key: item.event_key,
      subject: item.subject,
      body: item.body,
      design: item.template_name?._id || item.template_name,
      template_name: item.template_name?.template_name || "Unknown Template",
      is_active: item.is_active,
      status: item.is_active ? "Active" : "Inactive",
    }));

  const getEmailTemplates = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);

      const params = {
        search,
        page,
        limit: 10,
      };

      if (statusFilter !== "") {
        params.is_active = statusFilter;
      }

      const response = await axios.get(
        `${constant.backend_url}/admin/get-emailcontent`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data?.success) {
        const docs = response.data.result || [];

        const formattedData = formatEmailContent(docs);

        setOriginalData(formattedData);
        setTotal(response.data.total || formattedData.length);
      } else {
        setOriginalData([]);
        setTotal(0);
      }
    } catch (error) {
      console.log(error);
      setOriginalData([]);
      setTotal(0);
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
  }, [search, statusFilter, page]);

  const getEmailContentForExport = async () => {
    const params = {
      search,
      page: 1,
      limit: total || 100000,
    };

    if (statusFilter !== "") {
      params.is_active = statusFilter;
    }

    const response = await axios.get(`${constant.backend_url}/admin/get-emailcontent`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!response.data?.success) return [];
    return formatEmailContent(response.data.result || []);
  };

  const handleUpdate = (record) => {
    setSelectedRow(record);
    setSelectedDesign(record.design ? record.design : globalDesign);
    setIsActive(record.is_active ?? false);
    setDrawerOpen(true);
  };

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
          is_active: isCreateActive,
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
          is_active: isActive,
        };

        const isSame =
          payload.subject === selectedRow.subject &&
          payload.body === selectedRow.body &&
          payload.is_active === selectedRow.is_active &&
          selectedDesign === selectedRow.template_name;

        if (isSame) {
          message.error("No changes detected");
          return;
        }
      }

      // UPDATE API PAYLOAD
      const response = await axios.post(
        `${constant.backend_url}/admin/edit-emailcontent`,
        {
          event_key: selectedRow?.event_key,
          subject: values?.subject,
          body: values?.body,
          template_name: selectedDesign, // send ObjectId
          is_active: isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
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

  useEffect(() => {
    if (createDrawerOpen) {
      setLiveCreateBody("");
      setLiveCreateSubject("");
      setCreateDesign(globalDesign);
      setIsCreateActive(true);
    }
  }, [createDrawerOpen, globalDesign]);

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

  const activeDesign = selectedDesign || globalDesign;
  const selectedTemplateObj = designTemplates.find(
    (t) => t._id === activeDesign
  );
  const previewHtml =
    selectedTemplateObj?.html
      ?.replace(/{{subject}}/g, liveSubject || selectedRow?.subject || "Email Subject")
      ?.replace(/{{content}}/g, formattedContent) || "<p>No template found</p>";

  const createTemplateObj = designTemplates.find(
    (t) => t._id === (createDesign || globalDesign)
  );
  const createPreviewHtml =
    createTemplateObj?.html
      ?.replace(/{{subject}}/g, liveCreateSubject || "Email Subject")
      ?.replace(/{{content}}/g, formattedCreateContent) || "<p>No template found</p>";

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/delete-emailcontent`,
        {
          event_key: deleteRecord?.event_key,
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
        showSearch={true}
        showStatusFilter={true}
        showExportButton={true}
        exportFilename="email_content"
        exportColumns={columns}
        getExportData={getEmailContentForExport}
        onSearch={(value) => debouncedSearch(value)}
        onVerifyChange={handleStatusFilter}
        searchTooltip="Search by event key, subject, template name"
        placeHolder="Search by event key, subject, template name"
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

            <div
              style={{
                background: "transparent",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "600px",
                  background: "#fff",
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
              <Switch checked={isActive} onChange={(val) => setIsActive(val)} />
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
                overflow: "auto",
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
                    // TEMPLATE SELECTION MODAL
                    onClick={() => setPendingDesign(template._id)}
                    style={{
                      border:

                        pendingDesign === template._id
                          ? "2px solid #c9f07b"
                          : "2px solid transparent",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "0.2s",
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
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "scale(0.4)",
                          transformOrigin: "top left",
                          width: "600px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: template.html,
                        }}
                      />
                    </div>
                    <p>{template.template_name}</p>
                  </div>
                ))}

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
                        setSelectedRow((prev) => ({
                          ...prev,
                          design: pendingDesign,
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

            <div
              style={{
                background: "transparent",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "center",
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
                    onClick={() => setPendingCreateDesign(template._id)}
                    style={{
                      border:
                        pendingCreateDesign === template._id
                          ? "2px solid #c9f07b"
                          : "2px solid transparent",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "0.2s",
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
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          transform: "scale(0.4)",
                          transformOrigin: "top left",
                          width: "600px",
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
