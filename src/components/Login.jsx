import { Button, Checkbox, Form } from "antd";
import InputField from "../reuseable/InputField";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { constant } from "../const";
import axios from "axios";
import { message } from "antd";
import { useState } from "react";
import { Flex, Input, Typography } from 'antd';
import theme from '../config/theme';

const { Title } = Typography;
const Login = () => {
    const navigate = useNavigate();
    const [showTwofa, setShowTwofa] = useState(false);
    const [loginData, setLoginData] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState("");


    const onFinish = async (values) => {
        try {
            const response = await axios.post(
                `${constant.backend_url}/admin/admin-login`,
                {
                    email: values.email,
                    password: values.password,
                }
            );

            const data = response.data;

            // ✅ Case 1: 2FA Required
            if (data?.twoFactorRequired) {
                setLoginData(values);
                setShowTwofa(true);
                message.info("Enter OTP");
                return;
            }

            // ✅ Case 2: Normal Login
            if (data?.success) {
                localStorage.setItem("adminToken", data.result.token);
                localStorage.setItem("admin", data.result.id)
                localStorage.setItem("user", JSON.stringify(data.result));
                navigate(`/${constant?.adminRoute}/dashboard`);
                return;
            }

            message.error(data?.message || "Login failed");

        } catch (error) {
            message.error(
                error.response?.data?.message || "Login failed"
            );
        }
    };

    const onChange = text => {
        console.log('onChange:', text);
    };
    const onInput = value => {
        console.log('onInput:', value);
    };
    const sharedProps = {
        onChange,
        onInput,
    };

    const handleOtpSubmit = async () => {
        if (twoFactorCode.length !== 6) {
            message.error("Enter 6 digit OTP");
            return;
        }

        try {
            const response = await axios.post(
                `${constant.backend_url}/admin/admin-login`,
                {
                    email: loginData.email,
                    password: loginData.password,
                    twoFactorCode: twoFactorCode,
                }
            );

            if (response.data.success) {
                localStorage.setItem(
                    "adminToken",
                    response.data.result.token
                );
                localStorage.setItem("admin", response.data.result.id)

                message.success("Login successful");
                navigate(`/${constant?.adminRoute}/dashboard`);
            }

        } catch (error) {
            message.error(
                error.response?.data?.message || "Invalid OTP"
            );
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center "
            style={{ background: "rgb(4, 35, 30)" }}
        >

            <div className="relative w-[95%] sm:w-[420px] p-10
                rounded-2xl 
                border border-white/20 
                "
                style={{
                    backgroundImage: `url(${theme.dashboardheaderimg.image})`,
                    // height: theme.dashboardheaderimg.height
                    backgroundPosition: 'center',
                    boxShadow: '0 0 10px rgba(94, 134, 128, 1)'
                }}
            >
                <div className="absolute inset-0 rounded-2xl 
                
                  opacity-0 hover:opacity-100 
                  transition duration-500 blur-xl -z-10"
                    style={{
                        backgroundImage: `url(${theme.dashboardheaderimg.image})`,
                        height: theme.dashboardheaderimg.height
                    }}
                />
                {/* Title */}
                <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-wide">
                    Welcome
                </h2>
                {!showTwofa ? (

                    <Form
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            label={<span className="text-white font-semibold">Username</span>}
                            name="email"
                            rules={[{ required: true, message: "Please input your username!" }]}
                        >
                            <InputField
                                prefix={<UserOutlined />}
                                placeholder="Enter Email"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-white font-semibold">Password</span>}
                            name="password"
                            rules={[{ required: true, message: "Please input your password!" }]}
                        >
                            <InputField
                                type="password"
                                prefix={<LockOutlined />}
                                placeholder="Enter password"
                                style={{ backgroundColor: "transparent", color: "white" }}
                                className="eye-icon-wrap"
                            />
                        </Form.Item>


                        {/* <Form.Item name="remember" valuePropName="checked">
                        <Checkbox className="text-white">Remember me</Checkbox>
                    </Form.Item> */}

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className="w-full rounded-lg font-semibold   bg-gradient-to-r from-blue-500 to-indigo-600 
           border-none 
           hover:from-indigo-600 hover:to-blue-500 
           transition-all duration-300"
                                style={{
                                    background: `${theme.sidebarSettings.activeBgColor}`,
                                    color: `${theme.sidebarSettings.activeTextColor}`
                                }}
                            >
                                Login
                            </Button>
                        </Form.Item>
                    </Form>

                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-2xl font-semibold text-white">
                            Two-factor authentication
                        </h2>
                        <p className="text-white">
                            Enter the code sent to your email.
                        </p>
                        <Input.OTP
                            length={6}
                            onChange={(value) => setTwoFactorCode(value)}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            onClick={handleOtpSubmit}
                        >
                            Verify & Login
                        </button>
                    </div>

                )}
            </div>
        </div>
    );
};

export default Login;
