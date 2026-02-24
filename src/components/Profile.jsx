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
import { useState } from "react";
import InputField from "../reuseable/InputField";
import ReusableCard from "../reuseable/Card";
import Anticon from "../reuseable/Anticon";
import ReButton from "../reuseable/Button";

const Profile = () => {
  const [profileImage, setProfileImage] = useState(null);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

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
                src={profileImage}
                icon={!profileImage && <UserOutlined />}
                className="shadow-md"
              />
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Name :</strong> John</p>
              <p><strong>User Name :</strong> john123</p>
              <p><strong>Email :</strong> john@gmail.com</p>
              <p><strong>Mobile :</strong> 9876543210</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Switch defaultChecked />
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
        <Col xs={24} md={12}>
          <ReusableCard
            title="Change Password"
            icon={<SaveOutlined />}
          >
            <Form layout="vertical">
              <Form.Item label="Old Password">
                <InputField size="large" type="password" />
              </Form.Item>

              <Form.Item label="New Password">
                <InputField size="large" type="password" />
              </Form.Item>

              <Form.Item label="Confirm Password">
                <InputField size="large" type="password" />
              </Form.Item>

              <ReButton
                type="primary"
                name="save"
                icon={<SaveOutlined />}
                size="large"
                className="rounded-lg"
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
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label={
                <span className="flex items-center gap-2">
                  <Anticon name="UserOutlined "/>
                  Name
                </span>
              }>
                <InputField size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="User Name">
                <InputField size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Mobile">
                <InputField size="large" />
              </Form.Item>
            </Col>
          </Row>

          <ReButton
            type="primary"
            name="save"
            icon={<SaveOutlined />}
            size="large"
            className="rounded-lg"
          />
        </Form>
      </ReusableCard>

    </div>
  );
};

export default Profile;
