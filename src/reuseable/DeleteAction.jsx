import { useState } from "react";
import { Button, Modal, ConfigProvider } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import theme from "../config/theme";

/**
 * Reusable delete action (button + confirm modal).
 *
 * Usage:
 * <DeleteAction
 *   title="Delete Campaign"
 *   description={<>Are you sure...?</>}
 *   onConfirm={async () => { ... }}
 *   loading={loading}
 * />
 */
const DeleteAction = ({
  buttonText = "Delete",
  buttonVariant = "solid", // "solid" | "outline"
  showIcon = true,
  disabled = false,

  title = "Delete",
  description = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",

  loading = false,
  onConfirm,
  onOpen,
  onClose,
}) => {
  const [open, setOpen] = useState(false);

  const openModal = () => {
    if (disabled) return;
    onOpen?.();
    setOpen(true);
  };

  const closeModal = () => {
    onClose?.();
    setOpen(false);
  };

  const handleConfirm = async () => {
    await onConfirm?.();
  };

  const solidBtnStyle = {
    background: "#eb2724c9",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  };

  const outlineBtnStyle = {
    background: "rgba(255,77,79,0.1)",
    border: "1px solid rgba(255,77,79,0.4)",
    color: "#ff4d4f",
    borderRadius: 6,
  };

  return (
    <>
      <Button
        size="small"
        icon={showIcon ? <DeleteOutlined /> : undefined}
        style={buttonVariant === "outline" ? outlineBtnStyle : solidBtnStyle}
        disabled={disabled}
        onClick={openModal}
      >
        {buttonText}
      </Button>

      <ConfigProvider
        theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}
      >
        <Modal
          open={open}
          onCancel={closeModal}
          footer={null}
          centered
          width="90%"
          style={{ maxWidth: 440 }}
          destroyOnHidden
          className="custom-modal modal-style"
          styles={{
            content: {
              background: theme.sidebarSettings.backgroundColor,
              borderRadius: 12,
            },
            body: { paddingTop: 20, paddingBottom: 20 },
          }}
        >
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <DeleteOutlined style={{ fontSize: 36, color: "#ff4d4f", marginBottom: 12 }} />
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>
              {title}
            </p>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              {description}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <Button
              onClick={closeModal}
              disabled={loading}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.75)",
                borderRadius: 8,
                height: 40,
              }}
            >
              {cancelText}
            </Button>
            <Button
              type="primary"
              danger
              loading={loading}
              onClick={handleConfirm}
              style={{
                background: "#ff4d4f",
                borderColor: "#ff4d4f",
                borderRadius: 8,
                height: 40,
                paddingInline: 24,
                fontWeight: 700,
              }}
            >
              {confirmText}
            </Button>
          </div>
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default DeleteAction;

