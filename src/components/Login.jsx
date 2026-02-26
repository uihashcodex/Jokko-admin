import { Button, Checkbox, Form } from "antd";
import InputField from "../reuseable/InputField";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { constant } from "../const";
import axios from "axios";
import { message } from "antd";

const Login = () => {
    const navigate = useNavigate();
const onFinish = async (values) => {
    try {
        const response = await axios.post(
            `${constant.backend_url}/admin-login`,
            {
                email: values.email,
                password: values.password,
            }
        );

        console.log("API Response:", response.data);

        if (response.data?.success) {

            // ✅ Save token correctly
            localStorage.setItem(
                "token",
                response.data.result.token
            );

            message.success(response.data.message);

            // ✅ Redirect
            navigate(`/${constant?.adminRoute}/dashboard`);

        } else {
            message.error(response.data?.message || "Login failed");
        }

    } catch (error) {
        console.error("Login Error:", error);

        message.error(
            error.response?.data?.message || "Something went wrong!"
        );
    }
};

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001f3f] via-[#002147] to-[#003366]">

            <div className="relative w-[95%] sm:w-[420px] p-10 
                bg-white/10 backdrop-blur-xl 
                rounded-2xl 
                border border-white/20 
                shadow-2xl 
                transition-all duration-500 
                hover:scale-[1.02] 
                hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                <div className="absolute inset-0 rounded-2xl 
                  bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-indigo-400/20 
                  opacity-0 hover:opacity-100 
                  transition duration-500 blur-xl -z-10" />
                {/* Title */}
                <h2 className="text-3xl font-bold text-white text-center mb-8 tracking-wide">
                    Welcome Back
                </h2>

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
                        />
                    </Form.Item>


                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox className="text-white">Remember me</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full rounded-lg font-semibold 
           bg-gradient-to-r from-blue-500 to-indigo-600 
           border-none 
           hover:from-indigo-600 hover:to-blue-500 
           transition-all duration-300"

                        >
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;
