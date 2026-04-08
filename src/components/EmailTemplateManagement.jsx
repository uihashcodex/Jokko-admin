import { useState, useEffect } from "react";
import { Button } from "antd";
import ReusableModal from "../reuseable/ReusableModal";
import theme from '../config/theme';
import { CheckOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";

const TemplateDesignSelector = () => {
    // default template
    // const [selectedTemplate, setSelectedTemplate] = useState("template1");

    // modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const WRAPPER_WIDTH = 260;
    const WRAPPER_HEIGHT = 300;

    const BASE_WIDTH = 600;
    const BASE_HEIGHT = 800;

    const scaleX = WRAPPER_WIDTH / BASE_WIDTH;
    const scaleY = WRAPPER_HEIGHT / BASE_HEIGHT;

    const SCALE = Math.min(scaleX, scaleY); // 🔥 IMPORTANT
    // useEffect(() => {
    //     const saved = localStorage.getItem("defaultTemplate");
    //     if (saved) {
    //         setSelectedTemplate(saved);
    //     }
    // }, []);

    // all templates
    // const templates = [
    //     "template1",
    //     "template2",
    //     "template3",
    //     "template4",
    //     "template5",
    //     "template6",
    // ];

    // click template
    const handleTemplateClick = (templateKey) => {
        setPendingTemplate(templateKey);
        setConfirmOpen(true);
    };
    // confirm change
    // const handleConfirm = () => {
    //     setSelectedTemplate(pendingTemplate);
    //     setConfirmOpen(false);
    // };

    // const handleConfirm = () => {
    //     setSelectedTemplate(pendingTemplate);
    //     setConfirmOpen(false);
    // };

    const handleConfirm = async () => {
        try {
            setLoading(true);

            await axios.post(
                `${constant.backend_url}/admin/update-template`,
                {
                    template_name: pendingTemplate.template_name,
                    isDefault: true,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            // 🔥 reload templates from backend
            await fetchTemplates();

            setConfirmOpen(false);
            setPendingTemplate(null);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTemplates();
    }, []);

    // const fetchTemplates = async () => {
    //     try {
    //         const res = await fetch("/admin/templates", {
    //             method: "POST",
    //         });

    //         const data = await res.json();

    //         if (data.success) {
    //             setTemplates(data.result);

    //             // 🔥 find default template
    //             const defaultTemp = data.result.find(t => t.isDefault);

    //             if (defaultTemp) {
    //                 setSelectedTemplate(defaultTemp);
    //             }
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };


    const fetchTemplates = async () => {
        const startTime = Date.now();

        try {
            setLoading(true);

            const response = await axios.post(
                `${constant.backend_url}/admin/templates`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (response.data?.success) {
                const templatesData = response.data.result || [];

                setTemplates(templatesData);

                // 🔥 find default template
                const defaultTemp = templatesData.find(t => t.isDefault);

                if (defaultTemp) {
                    setSelectedTemplate(defaultTemp);
                }
            }

        } catch (error) {
            console.error(error);
            setTemplates([]);
        } finally {
            const elapsed = Date.now() - startTime;
            const minTime = 500;

            setTimeout(() => {
                setLoading(false);
            }, Math.max(minTime - elapsed, 0));
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* 🔥 Selected Template */}
            <div

                style={{ marginBottom: "20px", }}
            >
                <div className="white text-2xl mb-5">Default Template</div>
                <div className="template-card template-des active ">
                    <div className="tick-icon">
                        <CheckOutlined />
                    </div>
                    {/* <div className="preview-wrapper">                   
                             <div
                            className="email-preview"
                       
                            dangerouslySetInnerHTML={{
                                __html: selectedTemplate?.html || "",
                            }}
                        />
                    </div> */}


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
                                __html: selectedTemplate?.html || "",
                            }}
                        />
                    </div>

                    <p className="white">
                        {selectedTemplate?.template_name?.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* 🔥 Other Templates */}
            <div>
                <div className="white text-2xl mb-5">Selecte Template</div>
                <div className="template-grid">
                    {templates
                        .filter((t) => t._id !== selectedTemplate?._id)
                        .map((template) => (
                            <div
                                key={template._id}
                                className="template-card template-des"
                                onClick={() => handleTemplateClick(template)}
                            >
                                <div className="tick-icon">
                                    <CheckOutlined />
                                </div>

                                {/* <div style={{ width: "220px", height: "200px", overflow: "hidden" }}> */}
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
                                            __html: template.html || "",
                                        }}
                                    />
                                </div>

                                <p className="white">{template.template_name.toUpperCase()}</p>

                                {/* 🔥 optional preview */}

                            </div>
                        ))}
                </div>
            </div>

            {/* 🔥 Confirmation Modal */}
            <ReusableModal
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                title="Confirm Template Change"
                description="Please confirm your selection"
                showFooter={false} // ❗ we handle buttons manually
                extraContent={
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>

                        <div
                            style={{
                                width: "300px",
                                height: "200px",
                                overflow: "hidden",
                                border: "1px solid #333",
                                borderRadius: "10px",
                                background: "#fff"
                            }}
                        >
                            <div
                                style={{
                                    width: "600px",
                                    height: "800px",
                                    transform: "scale(0.5)",
                                    transformOrigin: "top left",
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: pendingTemplate?.html || "",
                                }}
                            />
                        </div>
                        <p style={{ marginBottom: "20px" }}>
                            Are you sure you want to use this template?
                        </p>

                        {/* Buttons */}
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            <Button onClick={() => setConfirmOpen(false)}>
                                Cancel
                            </Button>

                            <Button
                                type="primary"
                                onClick={handleConfirm}
                                style={{ background: theme.sidebarSettings.activeBgColor }}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                }
            />

            {/* 🔥 Styles */}
            <style>{`
        // .template-grid {
        //   display: flex;
        //   gap: 20px;
        //   flex-wrap: wrap;
        // }

        .template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

   .template-card {
  background: rgba(255,255,255,0.05);
  padding: 10px;
  border-radius: 12px;
  max-width: 260px;
  width:100%;
}

.template-card:hover {
  transform: translateY(-5px);
}

        .template-card img {
          width: 180px;
          border-radius: 10px;
          border: 2px solid transparent;
        }

        .template-card:hover img {
          transform: scale(1.05);
          border-color: #1890ff;
        }

        .template-card.active img {
          border: 3px solid #52c41a;
          transform: scale(1.05);
        }
          .template-card {
              cursor: pointer;
              text-align: center;
              transition: 0.3s;
              position: relative; /* IMPORTANT */
                 }

.preview-wrapper {
  width: 260px;
  height: 160px; /* 🔥 FIX HEIGHT (landscape look) */
  overflow: hidden;
  border-radius: 10px;
  background: #fff;

  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.email-preview {
  width: 600px;
  transform: scale(0.35); /* 🔥 FIXED SMALL SCALE */
  transform-origin: top center;
}

.scale-container {
  display: flex;
  justify-content: center;
  align-items: center;
}


/* Image styling */
.template-card img {
  width: 180px;
  border-radius: 10px;
  border: 2px solid transparent;
}

/* Hover effect */
.template-card:hover img {
  transform: scale(1.05);
  border: 2px solid #C9F07B;
}

/* Active (selected template) */
.template-card.active img {
  border: 3px solid #52c41a;
  transform: scale(1.05);
}

/* 🔥 Tick Icon Base */
.tick-icon {
  position: absolute;
  top: 15px;
  right: 40px;
  background: #52c41a;
  color: white;
  border-radius: 50%;
  padding: 5px;
  font-size: 10px;

  display: none;

  z-index: 10; /* 🔥 IMPORTANT FIX */
}


/* ✅ Always show for active */
.template-card.active .tick-icon {
  display: block;
}

/* 🖱️ Show only on hover */
.template-card:hover .tick-icon {
  display: block;
}
      `}</style>
        </div>
    );
};

export default TemplateDesignSelector;
