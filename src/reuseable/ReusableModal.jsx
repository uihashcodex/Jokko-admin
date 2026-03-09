import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  // Input,
  // Select,
  Upload,
  Switch
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import InputField from "./InputField";
import Select from "./SelectField";
import { useEffect } from "react";
import theme from "../config/theme";
import { ConfigProvider } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { message } from "antd";
import { Tooltip } from "antd";

const ReusableModal = ({
  open,
  onCancel,
  onSubmit,
  title,
  fields,
  initialValues,
  extraContent,
  maskClosable = false,
  description,
  showFooter = true
}) => {
  const [form] = Form.useForm();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Address copied!");
  };

  // ✅ Set Initial Values Properly
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  // ✅ Field Renderer
  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <InputField
            size="large"
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        );

      case "password":
        return (
          <InputField.Password
            size="large"
            placeholder={field.placeholder}
          />
        );

      case "select":
        return (
          <Select
            size="large"
            options={field.options}
            placeholder={field.placeholder}
            className="custom-select remodal-select"
          />
        );

      case "multiselect":
        return (
          <Select
            mode="multiple"
            size="large"
            style={{ width: "100%" }}
            options={[...field.options]}
            placeholder={field.placeholder}
          />
        );

      case "switch":
        return <Switch size="default" />;

      case "file":
        return (
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button
              icon={<UploadOutlined />}
              size="large"
              className="w-full"
            >
              Select File
            </Button>
          </Upload>
        );

      case "image":
        return (
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        );
      case "copy":
        return (
          <InputField
            size="large"
            disabled
            value={form.getFieldValue(field.name)}
            suffix={
              <Tooltip title="Copy address">
              <CopyOutlined
                style={{ cursor: "pointer", color: "#fff" }}
                onClick={() =>
                  handleCopy(form.getFieldValue(field.name))
                }
              />
              </Tooltip>

            }
          />
        );

      default:
        return (
          <InputField
            size="large"
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: theme.sidebarSettings.backgroundColor,
        },
      }}
    >
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width="90%"
      style={{ maxWidth: 700 }}
      destroyOnHidden
      maskClosable={maskClosable}
      className="custom-modal modal-style"
      styles={{
        content: {
          background: theme.sidebarSettings.backgroundColor,
          borderRadius: 12,
        },
        header: {
          background: theme.sidebarSettings.backgroundColor,
          borderBottom: `1px solid ${theme.borderColor}`,
          color: "#fff",
        },
        body: {
          paddingTop: 20,
          paddingBottom: 20,
          maxHeight: "80vh",
          overflowY: "auto",
          overflowX:"hidden",
        },
      }}
   
    >
      {/* HEADER */}
      <div 
      
        style={{
          borderBottom: `1px solid ${theme.borderColor || "rgba(255,255,255,0.08)"}`,
          paddingBottom: 16,
          marginBottom: 24,
          background: theme.sidebarSettings.backgroundColor,
          color: "#fff"
        }}>
        <h2 style={{ color: theme.sidebarSettings.textColor, fontWeight: 500,fontSize:22 }}>
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
            {description || "Please fill the details below carefully."}        </p>
      </div>

      {extraContent}


      {fields && fields.length > 0 && (
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Row gutter={[20, 10]}>
          {fields.map((field) => (
            <Col
              key={field.name}
              xs={24}
              sm={24}
              md={field.span || (fields.length === 1 ? 24 : 12)}
              lg={field.span || (fields.length === 1 ? 24 : 12)}
            >
              <Form.Item
                label={
                  <span 
                    style={{
                      fontWeight: 500,
                      color: theme.sidebarSettings.textColor
                    }}
                  >
                    {field.label}
                  </span>
                }
                name={field.name}
                rules={field.rules}
                valuePropName={
                  field.type === "switch" ? "checked" : "value"
                }
                className="mb-4"
              >
                {renderField(field)}
              </Form.Item>
            </Col>
          ))}
        </Row>

        {/* FOOTER */}
            {showFooter && (
        <div className="flex justify-between gap-3 mt-6 pt-4 border-t"
        
            style={{
              borderTop: `1px solid ${theme.borderColor || "rgba(255,255,255,0.08)"}`
            }}>
          <Button
            size="large"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="primary"
            size="large"
            htmlType="submit"
          >
            Submit
          </Button>
        </div>
            )}
      </Form>
      )}
    </Modal>
    </ConfigProvider>
  );
};

export default ReusableModal;
