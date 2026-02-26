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
  Input,
  Select,
  Upload,
  Switch
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const ReusableModal = ({
  open,
  onCancel,
  onSubmit,
  title,
  fields,
  initialValues,
  maskClosable = false
}) => {
  const [form] = Form.useForm();

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
          <Input
            size="large"
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        );

      case "password":
        return (
          <Input.Password
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
            options={field.options}
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

      default:
        return (
          <Input
            size="large"
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width="90%"
      style={{ maxWidth: 700 }}
      destroyOnHidden
      maskClosable={maskClosable}
      className="custom-modal"
      styles={{
        body: {
          paddingTop: 20,
          paddingBottom: 20,
          maxHeight: "80vh",
          overflowY: "auto",
          overflowX:"hidden"
        },
      }}
    >
      {/* HEADER */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold tracking-wide">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Please fill the details below carefully.
        </p>
      </div>

      {/* FORM */}
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
                  <span className="font-medium text-gray-700">
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
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
      </Form>
    </Modal>
  );
};

export default ReusableModal;
