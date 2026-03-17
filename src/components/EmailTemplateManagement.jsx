import { useState, useRef, useEffect } from "react";
import { Button } from "antd";
import ReusableModal from "../reuseable/ReusableModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import theme from '../config/theme';
import { Card } from "antd";
import axios from "axios";
import { constant } from "../const";
import { message } from "antd";


const EmailTemplateManagement = () => {

    const [selectedImg, setSelectedImg] = useState(null);
    const [content, setContent] = useState("");
    const [templateType, setTemplateType] = useState("email");
    const [open, setOpen] = useState(false);
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [subject, setSubject] = useState("");
    const previewRef = useRef(null);
    const editorRef = useRef(null);
    const [eventKey, setEventKey] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [designModalOpen, setDesignModalOpen] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState("");
    const usedDesigns = emailTemplates.map(t => t.design);
    
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
    const campaignTemplates = {
        template1: `
<div style="font-family:Arial, sans-serif;">
  
  <div style="max-width:600px;margin:auto;">
<div style="background:#122f2a;border:1px solid #ddd;color:#fff">
    <div style="height:10px;background:#c9f07b"></div>

    <div style="text-align:center;padding:30px">
      <img src="/img/logo.png" style="width:80px;margin-bottom:10px"/>
      <h1 style="color:#fff;margin:10px 0;" class="text-lg font-bold">
        Welcome to Jokko Wallet
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
      <h2 style="margin-bottom:15px;color:#333">Welcome!</h2>


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
        Lorem odio soluta quae dolores sapiente voluptatibus recusandae
        aliquam fugit ipsam.
      </p>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Veniam corporis sint eum nemo animi velit exercitationem impedit.
      </p>

      <div style="text-align:center;margin:30px 0">

        <a href="{{consult_link}}"
           style="
           background:#3f6477;
           color:white;
           padding:12px 26px;
           text-decoration:none;
           border-radius:6px;
           font-weight:600;
           display:inline-block;">
           Book a Free Consultation
        </a>

      </div>

      <div>
        {{content}}
      </div>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Veniam corporis sint eum nemo animi velit exercitationem impedit.
      </p>

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
     Welcome 😀
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
    };

    const [campaignStats, setCampaignStats] = useState({
        daily_limit: 0,
        sent_today: 0,
        monthly_limit: 0,
        sent_this_month: 0
    });

    const addFields = [
        {
            name: "event_key",
            label: "Event Key",
            type: "text",
            rules: [{ required: true, message: "Event key required" }]
        },
        {
            name: "subject",
            label: "Email Subject",
            type: "text",
            rules: [{ required: true, message: "Subject required" }]
        },
        {
            name: "body",
            label: "Email Body",
            type: "textarea",
            span: 24,
            rules: [{ required: true, message: "Body required" }]
        },
        {
            name: "is_active",
            label: "Active",
            type: "switch"
        }
    ];

    const editFields = [
        {
            name: "subject",
            label: "Email Subject",
            type: "text",
            placeholder: "Enter subject",
            rules: [{ required: true, message: "Subject is required" }]
        },
        {
            name: "body",
            label: "Email Body",
            type: "textarea",
            placeholder: "Enter email body",
            rules: [{ required: true, message: "Body is required" }],
            span: 24
        },
        {
            name: "is_active",
            label: "Active",
            type: "switch"
        }
    ];

    const handleCreate = () => {
        setOpen(true);
    };

    const handleDeleteTemplate = async (id) => {
        try {

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-email-template`,
                { id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                    }
                }
            );

            if (res.data.success) {
                message.success("Template deleted");
                getEmailTemplates();
            }

        } catch (err) {
            message.error("Delete failed");
        }
    };



    // const handleSelectTemplate = (template, templateKey) => {
    //     setSelectedImg(templateKey);
    //     setContent(template.body);
    //     setSubject(template.subject);
    //     setEventKey(template.event_key);
    //     setIsActive(template.is_active);
    //     setOpen(false);
    // };

    const handleSelectTemplate = (template) => {

        const design = template.design || "template1";

        setSelectedImg(design);  
        setSelectedDesign(design);

        setContent(template.body);
        setSubject(template.subject);
        setEventKey(template.event_key);
        setIsActive(template.is_active);

        setOpen(false);
    };
    
    // const previewHtml =
    //     templateType === "email"
    //         ? templates[selectedImg]?.replace("{{content}}", content || "Type email content here...")
    //         : campaignTemplates[selectedImg]?.replace("{{content}}", content || "Type campaign content here...");

    // const previewHtml = content;

    // const previewHtml =
    //     templates[selectedImg]
    //         ?.replace("{{subject}}", subject || "Email Subject")
    //         ?.replace("{{content}}", content || "Type email content here...");

    // const previewHtml =
    //     templates[selectedImg]
    //         ?.replace(/{{subject}}/g, subject || "Email Subject")
    //         ?.replace(/{{content}}/g, content || "Type email content here...");

    const previewHtml =
        templateType === "campaign"
            ? campaignTemplates[selectedImg]
                ?.replace(/{{content}}/g, content || "Type campaign content here...")
            : templates[selectedImg]
                ?.replace(/{{subject}}/g, subject || "Email Subject")
                ?.replace(/{{content}}/g, content || "Type email content here...");

    useEffect(() => {
        if (previewRef.current && editorRef.current) {

            const preview = previewRef.current;
            const previewParent = preview.parentElement;

            const previewHeight = preview.offsetHeight;

            const previewStyle = window.getComputedStyle(previewParent);
            const paddingTop = parseFloat(previewStyle.paddingTop);
            const paddingBottom = parseFloat(previewStyle.paddingBottom);
            const borderTop = parseFloat(previewStyle.borderTopWidth);
            const borderBottom = parseFloat(previewStyle.borderBottomWidth);

            const totalExtra = paddingTop + paddingBottom + borderTop + borderBottom;

            const toolbar = editorRef.current.querySelector(".ql-toolbar");
            const container = editorRef.current.querySelector(".ql-container");

            if (toolbar && container) {
                const toolbarHeight = toolbar.offsetHeight;

                container.style.height =
                    previewHeight + totalExtra - toolbarHeight + "px";
            }
        }
    }, [content, selectedImg]);

    // const handleSelectDesign = (designKey) => {
    //     setSelectedDesign(designKey);
    //     setDesignModalOpen(false);
    //     setAddModalOpen(true);
    // };


    const handleSelectDesign = (designKey) => {
        setSelectedDesign(designKey);
        // show design preview immediately
        setSelectedImg(designKey);
        setSubject("");
        setContent("");
        setEventKey("");
        setDesignModalOpen(false);
        setAddModalOpen(true);
    };

    const getEmailTemplates = async () => {
        const startTime = Date.now();

        try {
            setLoading(true);

            const res = await axios.get(
                `${constant.backend_url}/admin/get-emailtemplates`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (res.data?.success) {
                setEmailTemplates(res.data?.result);
            } else {
                setEmailTemplates([]);
            }

        } catch (error) {
            console.error(error);
        }
        finally {
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
    const handleEditSubmit = async (values) => {
        const startTime = Date.now();
        if (
            values?.subject === subject &&
            values?.body === content &&
            (values?.is_active ?? false) === isActive
        ) {
            message.error("No changes detected");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
                `${constant.backend_url}/admin/edit-email-template`,
                {
                    event_key: eventKey,
                    subject: values?.subject,
                    body: values?.body,
                    is_active: values?.is_active ?? false
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (res.data?.success) {
                message.success(res.data?.message ||  "Template updated successfully");
                setEditModalOpen(false);
                setSubject(values?.subject);
                setContent(values?.body);
                setIsActive(values?.is_active ?? false);
                getEmailTemplates();
            }

        } catch (error) {
            console.error(error);
            message.error("Failed to update template");
        } finally {
            const elapsed = Date.now() - startTime;
            const minTime = 500;

            setTimeout(() => {
                setLoading(false);
            }, Math.max(minTime - elapsed, 0));
        }

    };

    const handleAddTemplate = async (values) => {


        if (emailTemplates.length >= 6) {
            message.error("Maximum 6 templates allowed");
            return;
        }

        try {

            const res = await axios.post(
                `${constant.backend_url}/admin/add-emailtemplate`,
                {
                    event_key: values.event_key,
                    subject: values.subject,
                    body: values.body,
                    design: selectedDesign,
                    is_active: values.is_active ?? false
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                    }
                }
            );

            if (res.data?.success) {

                message.success(res.data?.message || "Template added successfully");

                // set states for editor + preview
                setSelectedImg(selectedDesign);
                setSubject(values.subject);
                setContent(values.body);
                setEventKey(values.event_key);
                setIsActive(values.is_active ?? false);

                setAddModalOpen(false);

                getEmailTemplates();
            }
            else {
                message.error(res.data?.message || "Failed to added");
            }

        } catch (error) {
            message.error( "Failed to add template");
        }

    };
    return (
        <div>
            <div
                className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center relative"
                style={{
                    backgroundImage: `url(${theme.dashboardheaderimg.image})`,
                    height: theme.dashboardheaderimg.height
                }}
            >
                <div className="display-3 w-full">
                    <h1 className="text-white p-7 font-bold text-2xl">
                        Email Template
                    </h1>
                </div>

                {templateType === "campaign" && (
                <div className="absolute bottom-2 right-2 ">
                    <div className="white font-bold text-lg">
                        Daily Limit : {campaignStats.sent_today} / {campaignStats.daily_limit}
                    </div>

                    <div className="white font-bold text-lg">
                        Monthly Limit : {campaignStats.sent_this_month} / {campaignStats.monthly_limit}
                    </div>
                </div>
                )}
            </div>
            {!selectedImg ? (

                <div className="template-start-wrapper ">
                    <Card hoverable className="rounded-xl shadow-md bg-[#5E5E5E33] border-gray-500">

                        <h2 className="text-3xl white mt-2">Email Template Management</h2>
                        <div className="flex justify-center gap-2 mt-3">
                            <Button
                                onClick={() => {
                                    setTemplateType("email");
                                    handleCreate();
                                }}
                                style={{ background: theme.sidebarSettings.activeBgColor }}
                                className="button-primary-hover"
                            >
                                Select Template
                            </Button>

                            <Button
                                onClick={() => {
                                    setTemplateType("campaign");
                                    handleCreate();
                                }}
                                style={{ background: theme.button.backgroundColor1 }}
                                className="button-primary-hover"
                            >
                                Select Campaign Template
                            </Button>
                        </div>
                    </Card>
                </div>

            ) : (

                <>
                    <div className="email-template-management display-2 flex-wrap">
                        <h2 className="text-3xl white mt-2">Email Template Management</h2>

                        <div className="mt-2 display-3 gap-2">
                                <Button
                                    onClick={() => {
                                        if (emailTemplates.length >= 6) {
                                            message.warning("Only 6 templates allowed");
                                            return;
                                        }
                                        setDesignModalOpen(true);
                                    }}
                                    style={{ background: theme.button.backgroundColor1 }}
                                >
                                    Add Template
                                </Button>
                            <Button
                                onClick={handleCreate}
                                style={{ background: theme.sidebarSettings.activeBgColor }}
                            >
                                Change Template
                            </Button>
                            
                        </div>
                    </div>

                    <div className="template-editor mt-20">
                        {/* editor + preview */}
                    </div>
                </>

            )}

            <ReusableModal
                open={open}
                onCancel={() => setOpen(false)}
                setOpen={setOpen}
                description={" "}
                title={templateType === "campaign" ? "Select Campaign Template" : "Select Email Template"}
                                extraContent={
                    <div className="template-selection">

                        <div className="template-selection">

                            <div className="template-selection">

                               

                                {emailTemplates.map((item, index) => {
                                    // const design = item.design || `template${(index % 3) + 1}`;
                                    const design = item.design || `template${(index % 6) + 1}`;                                    
                                    return (
                                        <div
                                            key={item._id}
                                            className="template-card"
                                            onClick={() => handleSelectTemplate(item)}
                                        >

                                            <div className="template-img-wrapper">

                                                <img
                                                    src={`/img/email-tem-${design.replace("template", "")}.png`}
                                                    alt="template"
                                                    className="template-img"
                                                />

                                                {emailTemplates.length >= 4 && (
                                                    <span
                                                        className="delete-icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTemplate(item._id);
                                                        }}
                                                    >
                                                        🗑
                                                    </span>
                                                )}

                                            </div>

                                            <p>{item.event_key.replace("_", " ").toUpperCase()}</p>

                                        </div>
                                    );
                                })}

                            </div>

                        </div>
                    </div>
                }
            />

            {selectedImg && (
                <div>
                    <div className="template-editor mt-20">

                        {/* LEFT EDITOR */}
                        <div className="editor" ref={editorRef}>
                            {/* <ReactQuill
                            value={content}
                            onChange={setContent}
                            placeholder="Type email content..."
                            className="white "

                        /> */}

                            <ReactQuill
                                value={content}
                                onChange={setContent}
                                placeholder="Type email content..."
                                modules={modules}
                                formats={formats}
                            />
                        </div>

                        {/* RIGHT PREVIEW */}
                        <div className="preview">
                            <div
                                ref={previewRef}
                                className="content-preview"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>

                    </div>
                    <div className="flex justify-between mt-3" >
                      
                        <Button
                            onClick={() => setEditModalOpen(true)}
                            style={{ background: theme.sidebarSettings.activeBgColor }}
                            className="button-primary-hover"
                        >
                            Edit Template
                        </Button>
                        <Button
                            style={{ background: theme.sidebarSettings.activeBgColor }}
                            className="button-primary-hover"
                        >
                            save Template
                        </Button>
                    </div>

                    <ReusableModal
                        open={editModalOpen}
                        onCancel={() => setEditModalOpen(false)}
                        title="Edit Email Template"
                        description="Update email template content"
                        fields={editFields}
                        initialValues={{
                            subject: subject,
                            body: content,
                            is_active: isActive
                        }}
                        onSubmit={handleEditSubmit}
                    />

                    <ReusableModal
                        open={addModalOpen}
                        onCancel={() => setAddModalOpen(false)}
                        title="Add Email Template"
                        description="Create new email template"
                        fields={addFields}
                        onSubmit={handleAddTemplate}
                    />
                 

                </div>
            )}

            <ReusableModal
                open={designModalOpen}
                onCancel={() => setDesignModalOpen(false)}
                title="Select Template Design"
                description="Choose a design"
                extraContent={
                    // <div className="template-selection">

                    //     <div
                    //         className="template-card"
                    //         onClick={() => handleSelectDesign("template4")}
                    //     >
                    //         <img src="/img/email-tem-4.png" className="template-img" />
                    //         <p>Design 4</p>
                    //     </div>

                    //     <div
                    //         className="template-card"
                    //         onClick={() => handleSelectDesign("template5")}
                    //     >
                    //         <img src="/img/email-tem-5.png" className="template-img" />
                    //         <p>Design 5</p>
                    //     </div>

                    //     <div
                    //         className="template-card"
                    //         onClick={() => handleSelectDesign("template6")}
                    //     >
                    //         <img src="/img/email-tem-6.png" className="template-img" />
                    //         <p>Design 6</p>
                    //     </div>

                    // </div>
                    <div className="template-selection">

                        <div
                            className={`template-card ${usedDesigns.includes("template4") ? "disabled" : ""}`}
                            onClick={() => !usedDesigns.includes("template4") && handleSelectDesign("template4")}
                        >
                            <img src="/img/email-tem-4.png" className="template-img" />
                            <p>Design 4</p>
                        </div>

                        <div
                            className={`template-card ${usedDesigns.includes("template5") ? "disabled" : ""}`}
                            onClick={() => !usedDesigns.includes("template5") && handleSelectDesign("template5")}
                        >
                            <img src="/img/email-tem-5.png" className="template-img" />
                            <p>Design 5</p>
                        </div>

                        <div
                            className={`template-card ${usedDesigns.includes("template6") ? "disabled" : ""}`}
                            onClick={() => !usedDesigns.includes("template6") && handleSelectDesign("template6")}
                        >
                            <img src="/img/email-tem-6.png" className="template-img" />
                            <p>Design 6</p>
                        </div>

                    </div>
                }
            />

        </div>
    );
};

export default EmailTemplateManagement;