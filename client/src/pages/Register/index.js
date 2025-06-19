import React, {useEffect} from 'react'
import { Form, message, Input } from 'antd';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterUser } from '../../apiIntergration/users';
import { HideLoading } from '../../redux/loadersSlice';
import { ShowLoading } from '../../redux/loadersSlice';
import { useDispatch } from 'react-redux';

function Register() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        console.log("Form values submitted:", values);
        try {
            dispatch(ShowLoading())
            const response = await RegisterUser(values);
            console.log("Raw response:", response);
            dispatch(HideLoading())

            if (response?.success) {
                message.success(response.message);
            } else {
                message.error(response?.error || "Unexpected error");
            }
        } catch (err) {
            dispatch(HideLoading())
            console.error("API call failed: ", err);
            message.error("Server is not responding or CORS blocked the request.");
        }
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate("/");
        }
    }, []);

    return (
        <div className='flex justify-center h-screen items-center bg-primary'>
            <div className='card p-3 w-500'>
                <h1 className='text-xl mb-2'>ĐĂNG KÝ</h1>
                <hr />
                <Form
                    form={form}
                    layout='vertical'
                    className='mt-3'
                    onFinish={onFinish}
                    initialValues={{
                        name: 'Test Name',
                        email: 'test@example.com',
                        password: '123456',
                    }}
                    onFinishFailed={(errorInfo) => {
                        console.log("Form validation failed:", errorInfo);
                    }}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: "Hãy điền tên tài khoản!!" }]}
                    >
                        <Input />
                    </Form.Item>

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
                        <Button fullWidth title="ĐĂNG KÝ VÀO TRANG" type="submit" />
                        <Link to="/login" className='text-primary'>Đã có tài khoản? Đăng nhập ngay</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Register;
