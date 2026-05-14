import { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, Popconfirm, Spin, message } from "antd";
import { DeleteOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import theme from "../config/theme";

const EMPTY_CREDENTIALS = {
  onramper: {
    url: "",
    apikey: "",
    secretKey: "",
    webhook: "",
  },
  transfi: {
    url: "",
    username: "",
    password: "",
    webhookSecret: "",
    mid: "",
  },
  fonbnk: {
    FONBNK_CLIENT_ID: "",
    FONBNK_CLIENT_SECRET: "",
    FONBNK_CLIENT_URLSIGNATURE: "",
    FONBNK_CLIENT_SOURCEPARAMS: "",
    FONBNK_URL: "",
    FONBNK_PAY_URL: "",
  },
};

const PROVIDERS = [
  {
    key: "onramper",
    title: "Onramper",
    fields: ["url", "apikey", "secretKey", "webhook"],
  },
  {
    key: "transfi",
    title: "TransFi",
    fields: ["url", "username", "password", "webhookSecret", "mid"],
  },
  {
    key: "fonbnk",
    title: "Fonbnk",
    fields: [
      "FONBNK_CLIENT_ID",
      "FONBNK_CLIENT_SECRET",
      "FONBNK_CLIENT_URLSIGNATURE",
      "FONBNK_CLIENT_SOURCEPARAMS",
      "FONBNK_URL",
      "FONBNK_PAY_URL",
    ],
  },
];

const FIELD_LABELS = {
  url: "URL",
  apikey: "API Key",
  secretKey: "Secret Key",
  webhook: "Webhook",
  username: "Username",
  password: "Password",
  webhookSecret: "Webhook Secret",
  mid: "MID",
  FONBNK_CLIENT_ID: "FONBNK Client ID",
  FONBNK_CLIENT_SECRET: "FONBNK Client Secret",
  FONBNK_CLIENT_URLSIGNATURE: "FONBNK URL Signature",
  FONBNK_CLIENT_SOURCEPARAMS: "FONBNK Source Params",
  FONBNK_URL: "FONBNK URL",
  FONBNK_PAY_URL: "FONBNK Pay URL",
};

const FIELD_PLACEHOLDERS = {
  url: "https://api.example.com",
  apikey: "Enter API key",
  secretKey: "Enter secret key",
  webhook: "enter webhook",
  username: "Enter username",
  password: "Enter password",
  webhookSecret: "Enter webhook secret",
  mid: "enter mid",
  FONBNK_CLIENT_ID: "enter client id",
  FONBNK_CLIENT_SECRET: "enter client secret",
  FONBNK_CLIENT_URLSIGNATURE: "enter client url signature",
  FONBNK_CLIENT_SOURCEPARAMS: "enter source params",
  FONBNK_URL: "https://sandbox-api.fonbnk.com",
  FONBNK_PAY_URL: "https://sandbox-pay.fonbnk.com",
};

const PROVIDER_LABELS = PROVIDERS.reduce(
  (labels, provider) => ({
    ...labels,
    [provider.key]: provider.title,
  }),
  {}
);

const normalizeTransfi = (transfi = {}) => ({
  ...transfi,
  username: transfi.username ?? "",
  password: transfi.password ?? transfi.secretKey ?? "",
  webhookSecret: transfi.webhookSecret ?? transfi.webhook ?? "",
});

const normalizeFonbnk = (fonbnk = {}) => ({
  ...fonbnk,
  FONBNK_CLIENT_ID: fonbnk.FONBNK_CLIENT_ID ?? fonbnk.FONBNK_CLIENT_ID ?? "",
  FONBNK_CLIENT_SECRET: fonbnk.FONBNK_CLIENT_SECRET ?? fonbnk.clientSecret ?? "",
  FONBNK_CLIENT_URLSIGNATURE: fonbnk.FONBNK_CLIENT_URLSIGNATURE ?? fonbnk.urlSignature ?? "",
  FONBNK_CLIENT_SOURCEPARAMS: fonbnk.FONBNK_CLIENT_SOURCEPARAMS ?? fonbnk.sourceParams ?? "",
  FONBNK_URL: fonbnk.FONBNK_URL ?? fonbnk.url ?? "",
  FONBNK_PAY_URL: fonbnk.FONBNK_PAY_URL ?? fonbnk.payUrl ?? "",
});

const mergeCredentials = (data = {}) => {
  const transfi = Array.isArray(data.transfi) ? data.transfi[0] : data.transfi;

  return {
    onramper: {
      ...EMPTY_CREDENTIALS.onramper,
      ...(data.onramper || {}),
    },
    transfi: {
      ...EMPTY_CREDENTIALS.transfi,
      ...normalizeTransfi(transfi || {}),
    },
    fonbnk: {
      ...EMPTY_CREDENTIALS.fonbnk,
      ...normalizeFonbnk(data.fonbnk || {}),
    },
  };
};

const getCredentialsPayload = (responseData = {}) => {
  const payload = responseData.data || responseData.result || responseData;
  if (payload?.onramper || payload?.transfi || payload?.fonbnk) return payload;
  return null;
};

const Env = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingField, setDeletingField] = useState("");
  const [credId, setCredId] = useState(null);
  const [hasCredentials, setHasCredentials] = useState(false);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${constant.backend_url}/admin/cred-get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const payload = getCredentialsPayload(data);

      if (data?.success && payload) {
        form.setFieldsValue(mergeCredentials(payload));
        setCredId(payload._id || payload.id || payload.credId || null);
        setHasCredentials(true);
      } else {
        form.setFieldsValue(EMPTY_CREDENTIALS);
        setCredId(null);
        setHasCredentials(false);
      }
    } catch (error) {
      form.setFieldsValue(EMPTY_CREDENTIALS);
      setCredId(null);
      setHasCredentials(false);

      if (error?.response?.status !== 404) {
        message.error("Failed to fetch credentials");
      }
    } finally {
      setLoading(false);
    }
  }, [form]);



  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const endpoint = hasCredentials ? "cred-update" : "cred-create";
      const { data } = await axios.post(
        `${constant.backend_url}/admin/${endpoint}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (data?.success) {
        message.success(data.message || "Credentials saved successfully");

        const payload = getCredentialsPayload(data);
        if (payload) {
          form.setFieldsValue(mergeCredentials(payload));
          setCredId(payload._id || payload.id || payload.credId || credId);
        }
        setHasCredentials(true);
        fetchCredentials();
      } else {
        message.error(data?.message || "Failed to save credentials");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (provider, field) => {
    if (!credId) {
      form.setFieldValue([provider, field], "");
      message.warning("Save credentials before deleting stored fields");
      return;
    }

    const fieldKey = `${provider}.${field}`;
    setDeletingField(fieldKey);

    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/cred-delete`,
        {
          credId,
          [provider]: {
            [field]: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (data?.success) {
        message.success(data.message || "Field deleted successfully");
        form.setFieldValue([provider, field], "");
        fetchCredentials();
      } else {
        message.error(data?.message || "Failed to delete field");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to delete field");
    } finally {
      setDeletingField("");
    }
  };

  return (
    <div>
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Credentials</h1>
        </div>
      </div>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={EMPTY_CREDENTIALS}
          onFinish={handleSave}
          style={styles.form}
        >
          {PROVIDERS.map((provider) => (
            <ProviderSection key={provider.key} title={provider.title}>
              <div style={styles.grid}>
                {provider.fields.map((field) => (
                  <EnvField
                    key={`${provider.key}.${field}`}
                    provider={provider.key}
                    field={field}
                    onDelete={handleDeleteField}
                    deleting={deletingField === `${provider.key}.${field}`}
                  />
                ))}
              </div>
            </ProviderSection>
          ))}

          <div style={styles.footer}>
            <Button
              htmlType="button"
              onClick={fetchCredentials}
              disabled={saving || loading}
              style={styles.resetBtn}
            >
              Reload
            </Button>
            <Button
              htmlType="submit"
              loading={saving}
              icon={<SaveOutlined />}
              style={styles.saveBtn}
            >
              {hasCredentials ? "Update Credentials" : "Create Credentials"}
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

const EnvField = ({ provider, field, onDelete, deleting }) => {
  const label = FIELD_LABELS[field];
  const providerLabel = PROVIDER_LABELS[provider] || provider;

  return (
    <div style={styles.fieldWrap}>
      <Form.Item
        label={<span style={styles.label}>{label}</span>}
        name={[provider, field]}
        style={styles.fieldItem}
      >
        <Input placeholder={FIELD_PLACEHOLDERS[field]} className="env-input" />
      </Form.Item>
      <Popconfirm
        title={`Are you sure you want to delete this ${label}?`}
        description={`If you delete it, your ${providerLabel} will not work.`}
        okText="Delete"
        cancelText="Cancel"
        onConfirm={() => onDelete(provider, field)}
      >
        <Button
          icon={<DeleteOutlined />}
          loading={deleting}
          disabled={deleting}
          danger
          style={styles.deleteBtn}
        />
      </Popconfirm>
    </div>
  );
};

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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "4px 16px",
  },
  fieldWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 42px",
    alignItems: "end",
    gap: 8,
  },
  fieldItem: {
    marginBottom: 14,
  },
  label: {
    color: "rgba(255,255,255,0.82)",
    fontWeight: 650,
    fontSize: 13,
  },
  deleteBtn: {
    height: 42,
    width: 42,
    marginBottom: 14,
    borderRadius: 8,
    background: "rgba(255,77,79,0.1)",
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
