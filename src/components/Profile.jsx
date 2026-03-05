import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Switch,
  Avatar,
  Upload,
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import InputField from "../reuseable/InputField";
import ReusableCard from "../reuseable/Card";
import Anticon from "../reuseable/Anticon";
import ReButton from "../reuseable/Button";
import ReusableModal from "../reuseable/ReusableModal";
import QRCode from "react-qr-code";
import axios from "axios";
import { message } from "antd"; 
import { constant } from "../const";


const Profile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [twoFAopen, setTwoFAOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const [isScretEnabled, setIsScretFAEnabled] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();  





  const handleGenerate2FA = async () => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/generate-2fa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.success) {
        setSecret(res.data.secret);
        setOtpauthUrl(res.data.otpauth_url);
        setTwoFAOpen(true);
      }
      console.log("SECRET:", secret);
    } catch (err) {
      const data = err.response?.data;

      if (data?.message === "2FA already generated") {

        // 🔥 Fetch existing secret from details API
        const profileRes = await axios.get(
          `${constant.backend_url}/admin/admin/details`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        setSecret(profileRes.data?.data?.twoFactorSecret);
        setOtpauthUrl(profileRes.data?.data?.otpauth_url);
        setTwoFAOpen(true);

        message.warning("Please verify existing 2FA setup");
      } else {
        message.error("Failed to generate 2FA");
      }
    }
  };
  const handleTwoFASubmit = async () => {
    if (otp.length !== 6) {
      message.error("Enter valid 6 digit OTP");
      return;
    }

    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/verify-2fa`,
        { token: otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.success) {
        setIsTwoFAEnabled(true);   // ✅ Switch turns ON
        setTwoFAOpen(false);      // ✅ Close modal
        setOtp("");
        message.success("2FA Enabled Successfully");
      }

    } catch (err) {
      message.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleDisableSubmit = async () => {
    if (otp.length !== 6) {
      message.error("Enter valid 6 digit OTP");
      return;
    }

    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/disable-2fa`,
        { token: otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.success) {
        setIsTwoFAEnabled(false);
        setDisableOpen(false);
        setOtp("");
        message.success("2FA Disabled Successfully");
      }

    } catch (err) {
      message.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${constant.backend_url}/admin/admin/details`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      console.log("PROFILE RESPONSE:", res.data);

      // const status = res.data?.data?.twoFactorEnabled;

      // setIsTwoFAEnabled(status === true);

      if (res.data.success) {
        setProfileData(res.data.data);  
        setLoading(false); // 🔥 store full data
        setIsTwoFAEnabled(res.data.data.twoFactorEnabled === true);

        form.setFieldsValue(
        //   {
        //   name: res.data.data.name,
        //   username: res.data.data.unique_id,
        //   mobile: res.data.data.mobile,
        // }
      );
      }
    

    } catch (err) {
      message.error("Failed to fetch profile");
    }
  };
  useEffect(() => {


    fetchProfile();
  }, []);


  const handleChangePassword = async (values) => {
    console.log("PASSWORD PAYLOAD:", values);   // ✅ ADD HERE

    try {

      if (values.newPassword !== values.confirmPassword) {
        message.error("New password and confirm password must match");
        return;
      }

      const res = await axios.post(
        `${constant.backend_url}/admin/change-password`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            
          },
          
        }
        
      );
      console.log(localStorage.getItem("adminToken"));
      if (res.data.success) {
        message.success(res.data.message || "Password changed successfully");
        form.resetFields();
      }

    } catch (err) {
      message.error(err.response?.data?.message || "Failed to change password");
    }
  };


  const handleUpdateProfile = async (values) => {
    try {
      const payload = {
        name: values.name,
        mobile: values.mobile,
        email: values.email,
      };
      console.log("PROFILE PAYLOAD:", payload);

      const res = await axios.post(
        `${constant.backend_url}/admin/update/admin/details`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.success) {
        message.success(res.data.message || "Profile updated successfully");
        fetchProfile(); 
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Update failed");
    }
  };


  return (
    <div className="p-6  min-h-screen">

      <Row gutter={[20, 20]}>

        {/* About Me */}
        <Col xs={24} md={12}>
          <ReusableCard
            title="About Me"
            icon={<UserOutlined />}
          >
            <div className="text-center mb-5">
              <Avatar
                size={110}
                src={profileData?.profile_picture || profileImage}
                icon={!profileImage && <UserOutlined />}
                className="shadow-md"
              />
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Name :</strong> {profileData?.name || "-"}</p>
              <p><strong>User Name :</strong> {profileData?.unique_id || "-"}</p>
              <p><strong>Email :</strong>{profileData?.email || "-"}</p>
              <p><strong>Mobile :</strong> {profileData?.mobile || "-"}</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={isTwoFAEnabled}
                onChange={(checked) => {
                  if (checked && !isTwoFAEnabled) {
                    handleGenerate2FA();
                  } else if (!checked && isTwoFAEnabled) {
                    setDisableOpen(true);
                  }
                }}
              />        
                   <span>Two Factor Authenticator</span>
            </div>

            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                setProfileImage(URL.createObjectURL(file));
                return false;
              }}
            >
              <Button
                icon={<UploadOutlined />}
                className="mt-4 w-full rounded-lg"
              >
                Change Photo
              </Button>
            </Upload>
          </ReusableCard>
        </Col>

        {/* Change Password */}
        <Col xs={24} md={12} style={{display:"flex",flexDirection:"column"}}>
          <ReusableCard
            title="Change Password"
            icon={<SaveOutlined />}
            style={{flex:1}}
            className="flex-1"
          >
            <Form form={form}  layout="vertical" className="profile-form ar3" onFinish={handleChangePassword}>

              <Form.Item label="Old Password" name="oldPassword" rules={[{ required: true }]}>
                <InputField size="large" type="password" />
              </Form.Item>

              <Form.Item label="New Password" name="newPassword" rules={[{ required: true }]}>
                <InputField size="large" type="password" />
              </Form.Item>

              <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true }]}>
                <InputField size="large" type="password" />
              </Form.Item>

              <ReButton
                htmlType="submit"
                type="primary"
                name="save"
                icon={<SaveOutlined style={{ color: "#000" }} />}
                size="large"
                className="rounded-lg save-btn"
              />

            </Form>
          </ReusableCard>
        </Col>
      </Row>

      {/* Personal Info */}
      <ReusableCard
        title="Update Personal Info"
        icon={<UserOutlined />}
        className="mt-6"
      >
        <Form layout="vertical" className="profile-form" onFinish={handleUpdateProfile}
>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label={
                <span className="flex items-center gap-2">
                  <Anticon name="UserOutlined " />
                  Name
                </span>
              }>
                <InputField size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="username" label="User Name">
                <InputField size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="mobile" label="Mobile">
                <InputField size="large" />
              </Form.Item>
            </Col>
          </Row>

          <ReButton
            htmlType="submit"
            type="primary"
            name="save"
            icon={<SaveOutlined />}
            size="large"
            className="rounded-lg save-btn"
          />
        </Form>
      </ReusableCard>



      <ReusableModal
        open={twoFAopen}
        onCancel={() => setTwoFAOpen(false)}
        // onSubmit={() => handleSubmit(otp)}
        title="Google Authentication"
        extraContent={
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#aaa", fontSize: "14px" }}>
              Install Google Authenticator app and scan QR Code.
              If unable to scan, enter this code manually.
            </p>

            {/* Secret Key */}
            <InputField
              size="large"
              type="text"
              value={secret}
              readOnly
              style={{ backgroundColor: "transparent" }}
              className="custom-input"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <Button
                onClick={() => navigator.clipboard.writeText(secret)}
              >
                Copy
              </Button>
            </div>

            <div className="display-3">
              <div style={{ textAlign: "center", marginTop: "20px", border: "3px solid #fff", }}>
                {otpauthUrl && <QRCode value={otpauthUrl} />}
                {/* <QRCode value="otpauth://totp/JokkoWallet:test?secret=JBSWY3DPEHPK3PXP&issuer=JokkoWallet" /> */}
              </div>
            </div>

            {/* OTP Input (Moved from fields) */}
            <div style={{ marginTop: "20px" }}>
              <InputField
                size="large"
                type="text"
                placeholder="Enter Your Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ backgroundColor: "transparent" }}
                className="custom-input"
              />
            </div>
            <div className="display-2 mt-20">
              <Button
                onClick={() => {
                  setTwoFAOpen(false);
                  setOtp("");
                  setOtp("");

                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                onClick={handleTwoFASubmit}
              >
                Submit
              </Button>
            </div>

          </div>
        }
      />

      <ReusableModal
        open={disableOpen}
        onCancel={() => {
          setDisableOpen(false);
          setOtp("");
        }}
        title="Disable Two Factor Authentication"
        extraContent={
          <div>
          <div style={{ display: "flex", flexDirection: "column" ,justifyContent:"center",alignItems:"center"}}>
            <div>

            <p style={{ color: "#aaa", fontSize: "14px" }}>
              Enter your 6 digit OTP to disable 2FA
            </p>
            </div>

            <div style={{ marginTop: "20px" }}>
              {/* <InputField
                size="large"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              /> */}
              {/* <Input.OTP
                length={6}
                onChange={(e) => setOtp(e.target.value)}

              />  */}
              <Input.OTP
                length={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              />
            </div>
            </div>

            <div className="display-2 mt-20">
              <Button
                onClick={() => {
                  setDisableOpen(false);
                  setOtp("");
                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                onClick={handleDisableSubmit}
              >
                Disable
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Profile;
