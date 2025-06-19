import React, { useEffect } from 'react';
import { Form, message, Input } from 'antd';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { LoginUser } from '../../apiIntergration/users';
import { useDispatch } from 'react-redux';
import { HideLoading } from '../../redux/loadersSlice';
import { ShowLoading } from '../../redux/loadersSlice';

function Login() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(ShowLoading())
            const response = await LoginUser(values);
            console.log("API Login response:", response);
            dispatch(HideLoading())

            if (response?.success) {
                message.success(response.message);
                localStorage.setItem("token", response.data);
                window.location.href="/";
            } else {
                message.error(response?.message || response?.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
            }
        } catch (error) {
            dispatch(HideLoading())
            console.error("Login API call failed:", error);
            message.error("Máy chủ không phản hồi hoặc đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Form validation failed:", errorInfo);
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate("/");
        }
    }, []);

    return (
        <div className='flex justify-center h-screen items-center bg-primary'>
            <div className='card p-3 w-500'>
                <h1 className='text-xl mb-2'>
                    ĐĂNG NHẬP
                </h1>
                <hr />
                <Form
                    form={form}
                    layout='vertical'
                    className='mt-3'
                    onFinish={onFinish} 
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Hãy điền email của tài khoản!!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: "Hãy điền mật khẩu của tài khoản!!" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <div className='flex flex-col mt-2 gap-1'>
                        <Button fullWidth title="ĐĂNG NHẬP VÀO TRANG" type="submit" />
                        <Link to="/register" className='text-primary'>Chưa có tài khoản? Đăng ký ngay</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Login;