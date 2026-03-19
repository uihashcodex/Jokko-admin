import { useState, useEffect } from "react";
import { Button } from "antd";
import ReusableModal from "../reuseable/ReusableModal";
import theme from '../config/theme';
import { CheckOutlined } from "@ant-design/icons";

const TemplateDesignSelector = () => {
    // default template
    const [selectedTemplate, setSelectedTemplate] = useState("template1");

    // modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState(null);


    useEffect(() => {
        const saved = localStorage.getItem("defaultTemplate");
        if (saved) {
            setSelectedTemplate(saved);
        }
    }, []);

    // all templates
    const templates = [
        "template1",
        "template2",
        "template3",
        "template4",
        "template5",
        "template6",
    ];

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

    const handleConfirm = () => {
        setSelectedTemplate(pendingTemplate);
        localStorage.setItem("defaultTemplate", pendingTemplate);

        setConfirmOpen(false);
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

                    <img
                        src={`/img/email-tem-${selectedTemplate.replace("template", "")}.png`}
                        alt="selected"
                        style={{ width: "250px", borderRadius: "10px" }}
                    />
                    <p style={{ marginTop: "10px", fontWeight: "bold" }} className="white">
                        {selectedTemplate.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* 🔥 Other Templates */}
            <div>
                <div className="white text-2xl mb-5">Selecte Template</div>
                <div className="template-grid">
                    {templates
                        .filter((t) => t !== selectedTemplate)
                        .map((template) => (
                            <div
                                key={template}
                                className="template-card template-des"
                                onClick={() => handleTemplateClick(template)}
                            >
                                <div className="tick-icon">
                                    <CheckOutlined />
                                </div>
                                <img
                                    src={`/img/email-tem-${template.replace("template", "")}.png`}
                                    alt={template}
                                />
                                <p className="white">{template.toUpperCase()}</p>
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


                        <img
                            src={`/img/email-tem-${pendingTemplate?.replace("template", "")}.png`}
                            alt="preview"
                            style={{
                                width: "250px",
                                borderRadius: "10px",
                                marginBottom: "20px",
                            }}
                        />

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
        .template-grid {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .template-card {
          cursor: pointer;
          text-align: center;
          transition: 0.3s;
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
  top: 8px;
  right: 8px;
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
