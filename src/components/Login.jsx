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
import { getFirstAllowedRoute } from "../utils/permissionCheck";

const { Title } = Typography;
const Login = () => {
    const navigate = useNavigate();
    const [showTwofa, setShowTwofa] = useState(false);
    const [loginData, setLoginData] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const onFinish = async (values) => {
        if (loginLoading) return;
        setLoginLoading(true);

        const start = Date.now();


        try {
            const response = await axios.post(
                `${constant.backend_url}/admin/admin-login`,
                {
                    email: values.email,
                    password: values.password,
                },
            );
            const elapsed = Date.now() - start;
            if (elapsed < 800) {
                await delay(800 - elapsed);
            }



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
                  const firstRoute = getFirstAllowedRoute(data?.result?.permissions || []);

  if (!firstRoute) {
    message.error("No page access assigned for this user");
    return;
  }
    navigate(`/${constant?.adminRoute}${firstRoute}`);
  return;
                // navigate(`/${constant?.adminRoute}/dashboard`);
                // return;

                
            }

            message.error(data?.message || "Login failed");

        } catch (error) {
            // message.error(
            //     error.response?.data?.message || "Login failed"
            // );
            const elapsed = Date.now() - start;
            if (elapsed < 800) {
                await delay(800 - elapsed);
            }
            message.error({
                content: error.response ?.data?.message || "Login failed",
                key: "loginError"
            });
        }
        finally {
            setLoginLoading(false); // ✅ important
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
        if (otpLoading) return;
        setOtpLoading(true);
        const start = Date.now();


        try {
            const response = await axios.post(
                `${constant.backend_url}/admin/admin-login`,
                {
                    email: loginData.email,
                    password: loginData.password,
                    twoFactorCode: twoFactorCode,
                },
            );



            const elapsed = Date.now() - start;
            if (elapsed < 800) {
                await delay(800 - elapsed);
            }

            if (response.data.success) {
                localStorage.setItem(
                    "adminToken",
                    response.data.result.token
                );
                localStorage.setItem("admin", response.data.result.id)

                message.success("Login successful");
localStorage.setItem("user", JSON.stringify(response.data.result));

const firstRoute = getFirstAllowedRoute(response?.data?.result?.permissions || []);



if (!firstRoute) {
  message.error("No page access assigned for this user");
  return;
}

navigate(`/${constant?.adminRoute}${firstRoute}`);            }

        } catch (error) {
            // message.error(
            //     error.response?.data?.message || "Invalid OTP"
            // );
            const elapsed = Date.now() - start;
            if (elapsed < 800) {
                await delay(800 - elapsed);
            }
            message.error({
                content: error.response?.data?.message || "Invalid OTP",
                key: "otpError"
            });
        }
        finally {
            setOtpLoading(false); // ✅ important
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
                            label={<span className="text-white font-semibold">Email</span>}
                            name="email"
                            rules={[{ required: true, message: "Please Enter your Email" }]}
                        >
                            <InputField
                                prefix={<UserOutlined />}
                                placeholder="Enter Email"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-white font-semibold">Password</span>}
                            name="password"
                            rules={[{ required: true, message: "Please Enter your password" }]}
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
                                loading={loginLoading}   // ✅ loader here
                                disabled={loginLoading}
                                className="w-full rounded-lg font-semibold   bg-gradient-to-r from-blue-500 to-indigo-600 
           border-none 
           hover:from-indigo-600 hover:to-blue-500 
           transition-all duration-300"
                                style={{
                                    background: `${theme.sidebarSettings.activeBgColor}`,
                                    color: `${theme.sidebarSettings.activeTextColor}`
                                }}
                            >
                                {loginLoading ? "Logging in..." : "Login"}
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
                        <Button
                            type="primary"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            loading={otpLoading}   // ✅ loader here
                            disabled={otpLoading}
                            onClick={handleOtpSubmit}
                        >
                            Verify & Login
                        </Button>
                    </div>

                )}
            </div>
        </div>
    );
};

export default Login;
