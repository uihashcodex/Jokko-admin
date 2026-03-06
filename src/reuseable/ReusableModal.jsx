// import { Modal, Form, Button, Row, Col } from "antd";
// import SelectField from "./SelectField";
// import InputField from "./InputField";

// const ReusableModal = ({
//     open,
//     onCancel,
//     onSubmit,
//     title,
//     fields,
//     initialValues
// }) => {

//     const [form] = Form.useForm();

//     const handleAfterOpenChange = (visible) => {
//         if (visible) {
//             const formattedValues = { ...(initialValues || {}) };

//             fields.forEach(field => {
//                 if (field.type === "multiselect") {
//                     const value = formattedValues[field.name];

//                     if (value && !Array.isArray(value)) {
//                         formattedValues[field.name] = [value];
//                     }

//                     if (!value) {
//                         formattedValues[field.name] = [];
//                     }
//                 }
//             });

//             form.setFieldsValue(formattedValues);
//         } else {
//             form.resetFields();
//         }
//     };

//     return (
//         <Modal
//             title={title}
//             open={open}
//             onCancel={onCancel}
//             footer={null}
//             centered
//             width={600}
//             destroyOnHidden
//             afterOpenChange={handleAfterOpenChange}
//         >
//             <Form
//                 form={form}
//                 layout="vertical"
//                 onFinish={onSubmit}
//             >
//                 {fields.map((field) => (
//                     <Form.Item
//                         key={field.name}
//                           label={<span style={{ fontWeight: 600 }}>{field.label}</span>}
//                         name={field.name}
//                         rules={field.rules}
//                     >
//                         {field.type === "select" ? (
//                             <SelectField options={field.options} />
//                         ) : field.type === "multiselect" ? (
//                             <SelectField mode="multiple" options={field.options} />
//                         ) : (
//                             <InputField/>
//                         )}
//                     </Form.Item>
//                 ))}

//                 <Row justify="start">
//                     <Col>
//                         <Button type="primary" htmlType="submit">
//                             Submit
//                         </Button>
//                     </Col>
//                 </Row>
//             </Form>
//         </Modal>
//     );
// };

// export default ReusableModal;

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
          />
        );

      case "multiselect":
        return (
          <Select
            mode="multiple"
            size="large"
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
      // case "copy":
      //   return (
      //     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      //       <InputField
      //         size="large"
      //         disabled
      //         value={form.getFieldValue(field.name)}
      //       />
      //       <CopyOutlined
      //         style={{ cursor: "pointer", fontSize: 18,color:"#fff" }}
      //         onClick={() =>
      //           handleCopy(form.getFieldValue(field.name))
      //         }
      //       />
      //     </div>
      //   );
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
              md={field.span || 24}
              lg={field.span || 24}
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
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t"
        
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
