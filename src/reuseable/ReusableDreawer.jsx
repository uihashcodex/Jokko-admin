import {
    Drawer,
    Form,
    Button,
    Row,
    Col,
    Input,
    Upload,
    Switch
} from "antd";
import { UploadOutlined, CopyOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import InputField from "./InputField";
import Select from "./SelectField";
import theme from "../config/theme";
import { Tooltip, message, ConfigProvider } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ReusableDrawer = ({
    open,
    onClose,
    onSubmit,
    title,
    fields,
    initialValues,
    extraContent,
    additionalContent,
    description,
    placement = "right",
    width = 500,
    showFooter = true
}) => {

    const [form] = Form.useForm();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        message.success("Copied!");
    };

    // set values when drawer opens
    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues || {});
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const renderField = (field) => {

        switch (field.type) {

            case "text":
                return (
                    <InputField
                        size="large"
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        onChange={(e) => {
                            if (field.onChange) {
                                field.onChange(e);
                            }
                        }}
                    />
                );

            case "textarea":
                return (
                    <Input.TextArea
                        rows={5}
                        size="large"
                        placeholder={field.placeholder}
                        style={{ background: "#5E5E5E33", color: "white" }}
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

            case "switch":
                return <Switch />;

            case "file":
                return (
                    <Upload beforeUpload={() => false} maxCount={1}>
                        <Button icon={<UploadOutlined />} className="w-full">
                            Select File
                        </Button>
                    </Upload>
                );
            case "editor":
                return (
                    <ReactQuill
                        value={form.getFieldValue(field.name)}
                        onChange={(value) => {
                            form.setFieldsValue({ [field.name]: value });

                            // 🔥 VERY IMPORTANT
                            if (field.onChange) {
                                field.onChange(value);
                            }
                        }}
                        placeholder={field.placeholder || "Type email content..."}
                        modules={field.modules}
                        formats={field.formats}
                        className="editor ar3"
                    />
                );

            case "copy":
                return (
                    <InputField
                        disabled
                        value={form.getFieldValue(field.name)}
                        suffix={
                            <Tooltip title="Copy">
                                <CopyOutlined
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        handleCopy(form.getFieldValue(field.name))
                                    }
                                />
                            </Tooltip>
                        }
                    />
                );

            default:
                return <InputField size="large" />;
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorBgElevated: theme.sidebarSettings.backgroundColor
                }
            }}
        >
            <Drawer
                title={title}
                placement={placement}
                onClose={onClose}
                open={open}
                width={width}
                destroyOnClose
                styles={{
                    header: {
                        background: theme.sidebarSettings.backgroundColor,
                        color: "#fff"
                    },
                    body: {
                        background: theme.sidebarSettings.backgroundColor,
                        color: "#fff"
                    }
                }}
                className="drawer-header"
            >

                <p className="text-sm text-gray-400 mb-6">
                    {description || "Please fill the details carefully"}
                </p>

                {extraContent}

                {fields && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onSubmit}
                    >

                        <Row gutter={[16, 10]}>
                            {fields.map((field) => (
                                <Col key={field.name} span={24}>
                                    <Form.Item
                                        label={<span style={{ color: "#fff", fontWeight: 500 }}>{field.label}</span>}
                                        name={field.name}
                                        rules={field.rules}
                                        valuePropName={
                                            field.type === "switch" ? "checked" : "value"
                                        }
                                    >
                                        {renderField(field)}
                                    </Form.Item>
                                </Col>
                            ))}
                        </Row>
                        {additionalContent}

                        {showFooter && (
                            <div className="flex justify-between mt-6">
                                <Button onClick={onClose}>
                                    Cancel
                                </Button>

                                <Button
                                    htmlType="submit"
                                    style={{
                                        background: theme.sidebarSettings.activeBgColor
                                    }}
                                >
                                    Submit
                                </Button>
                            </div>
                        )}

                    </Form>
                )}

            </Drawer>
        </ConfigProvider>
    );
};

export default ReusableDrawer;