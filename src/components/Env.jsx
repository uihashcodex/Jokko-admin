import { useEffect, useState } from "react";
import { Button, Form, Input, Spin, message } from "antd";
import { PlusOutlined, SaveOutlined, SettingOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import theme from "../config/theme";

const DEFAULT_ENV = {
  onramper: {
    url: "https://api-stg.onramper.com",
    apikey: "11111324324fdsfdsfdfds11",
    secretKey: "onramper_secret",
    webhook: "https://yourdomain.com/onramper/webhook",
  },
  transfi: [
    {
      url: "https://sandbox-api.transfi.com",
      apikey: "transfi_api_key",
      secretKey: "transfi_secret",
      webhook: "https://yourdomain.com/transfi/webhook",
      mid: "MID123456",
    },
  ],
  fonbnk: {
    url: "https://api.fonbnk.com",
    apikey: "fonbnk_api_key",
    secretKey: "fonbnk_secret",
    webhook: "https://yourdomain.com/fonbnk/webhook",
  },
};

const Env = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  };

  useEffect(() => {
    const fetchEnv = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${constant.backend_url}/admin/get-env`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        if (data?.success && data?.result) {
          form.setFieldsValue(data.result);
        } else {
          form.setFieldsValue(DEFAULT_ENV);
        }
      } catch {
        form.setFieldsValue(DEFAULT_ENV);
      } finally {
        setLoading(false);
      }
    };

    fetchEnv();
  }, [form]);

  const handleUpdate = async (values) => {
    setSaving(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/update-env`,
        values,
        { headers: authHeader }
      );

      if (data?.success) {
        message.success(data.message || "Environment updated successfully");
      } else {
        message.error(data?.message || "Failed to update environment");
      }
    } catch {
      message.error("Failed to update environment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Env</h1>
        </div>
      </div>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={DEFAULT_ENV}
          onFinish={handleUpdate}
          style={styles.form}
        >
          <ProviderSection title="Onramper">
            <ProviderFields namePrefix={["onramper"]} />
          </ProviderSection>

          <ProviderSection title="TransFi">
            <Form.List name="transfi">
              {(fields, { add, remove }) => (
                <div style={{ display: "grid", gap: 14 }}>
                  {fields.map((field, index) => (
                    <div key={field.key} style={styles.transfiItem}>
                      <div style={styles.transfiHeader}>
                        <span style={styles.transfiTitle}>TransFi Config {index + 1}</span>
                        {fields.length > 1 && (
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                            style={styles.removeBtn}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <ProviderFields namePrefix={[field.name]} includeMid />
                    </div>
                  ))}

                  <Button
                    icon={<PlusOutlined />}
                    onClick={() =>
                      add({
                        url: "",
                        apikey: "",
                        secretKey: "",
                        webhook: "",
                        mid: "",
                      })
                    }
                    style={styles.addBtn}
                  >
                    Add TransFi Config
                  </Button>
                </div>
              )}
            </Form.List>
          </ProviderSection>

          <ProviderSection title="Fonbnk">
            <ProviderFields namePrefix={["fonbnk"]} />
          </ProviderSection>

          <div style={styles.footer}>
            <Button
              htmlType="button"
              onClick={() => form.setFieldsValue(DEFAULT_ENV)}
              style={styles.resetBtn}
            >
              Reset
            </Button>
            <Button
              htmlType="submit"
              loading={saving}
              icon={<SaveOutlined />}
              style={styles.saveBtn}
            >
              Update Env
            </Button>
          </div>
        </Form>
      </Spin>

      <style>{`
        .env-input {
          background-color: #0e2e2a !important;
          border: 1px solid #2e5e4e !important;
          color: #fff !important;
          border-radius: 8px !important;
          height: 42px !important;
        }
        .env-input:hover,
        .env-input:focus {
          border-color: #c9f07b !important;
          box-shadow: 0 0 0 2px rgba(201,240,123,0.12) !important;
        }
        .env-input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
      `}</style>
    </div>
  );
};

const ProviderSection = ({ title, children }) => (
  <section style={styles.section}>
    <div style={styles.sectionHeader}>
      <div style={styles.iconWrap}>
        <SettingOutlined style={{ color: theme.sidebarSettings.activeBgColor, fontSize: 18 }} />
      </div>
      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionSubtitle}>Edit provider credentials and webhook settings.</p>
      </div>
    </div>
    <div style={styles.divider} />
    {children}
  </section>
);

const ProviderFields = ({ namePrefix, includeMid = false }) => (
  <div style={styles.grid}>
    <EnvField label="URL" name={[...namePrefix, "url"]} placeholder="https://api.example.com" />
    <EnvField label="API Key" name={[...namePrefix, "apikey"]} placeholder="Enter API key" />
    <EnvField label="Secret Key" name={[...namePrefix, "secretKey"]} placeholder="Enter secret key" />
    <EnvField label="Webhook" name={[...namePrefix, "webhook"]} placeholder="https://yourdomain.com/webhook" />
    {includeMid && <EnvField label="MID" name={[...namePrefix, "mid"]} placeholder="MID123456" />}
  </div>
);

const EnvField = ({ label, name, placeholder }) => (
  <Form.Item
    label={<span style={styles.label}>{label}</span>}
    name={name}
    rules={[{ required: true, message: `${label} is required` }]}
  >
    <Input placeholder={placeholder} className="env-input" />
  </Form.Item>
);

const styles = {
  form: {
    display: "grid",
    gap: 18,
    padding: "0 10px 24px",
  },
  section: {
    background: "linear-gradient(135deg, #122f2a 0%, #0e2521 100%)",
    border: "1px solid #1f4e40",
    borderRadius: 12,
    padding: 22,
    boxShadow: "0 8px 28px rgba(0,0,0,0.24)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    color: "#fff",
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
  },
  sectionSubtitle: {
    color: "rgba(255,255,255,0.45)",
    margin: "2px 0 0",
    fontSize: 12,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    margin: "18px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "4px 16px",
  },
  label: {
    color: "rgba(255,255,255,0.82)",
    fontWeight: 650,
    fontSize: 13,
  },
  transfiItem: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 14,
    background: "rgba(0,0,0,0.12)",
  },
  transfiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  transfiTitle: {
    color: "#fff",
    fontWeight: 700,
  },
  addBtn: {
    justifySelf: "start",
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.35)",
    color: "#c9f07b",
    borderRadius: 8,
    height: 40,
  },
  removeBtn: {
    background: "rgba(255,77,79,0.1)",
    border: "1px solid rgba(255,77,79,0.4)",
    color: "#ff4d4f",
    borderRadius: 8,
    height: 36,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 4,
  },
  resetBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.68)",
    borderRadius: 8,
    height: 42,
    paddingInline: 22,
  },
  saveBtn: {
    background: "#c9f07b",
    borderColor: "#c9f07b",
    color: "#000",
    fontWeight: 700,
    borderRadius: 8,
    height: 42,
    paddingInline: 24,
  },
};

export default Env;
