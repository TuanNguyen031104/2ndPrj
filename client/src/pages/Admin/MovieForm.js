import { Col, Form, Input, message, Modal, Row, Select, DatePicker } from 'antd';
import React, { useEffect } from 'react';
import Button from "../../components/Button";
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../redux/loadersSlice';
import { AddMovie, UpdateMovie } from '../../apiIntergration/movies';
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;

function MovieForm({
    showMovieFormModal,
    setShowMovieFormModal,
    selectedMovie,
    setSelectedMovie,
    getData,
    formType
}) {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    useEffect(() => {
        if (selectedMovie && formType === "edit") {
            form.setFieldsValue({
                ...selectedMovie,
                releaseDate: moment(selectedMovie.releaseDate),
            });
        } else {
            form.resetFields();
        }
    }, [selectedMovie, formType, form]);

    const onFinish = async (values) => {
        try {
            dispatch(ShowLoading());
            let response = null;

            const payload = {
                ...values,
                releaseDate: values.releaseDate.format("YYYY-MM-DD"),
            };

            if (formType === "add") {
                response = await AddMovie(payload);
            } else {
                response = await UpdateMovie({ ...payload, movieId: selectedMovie._id });
            }

            if (response.success) {
                getData();  
                message.success(response.message);
                setShowMovieFormModal(false);
                setSelectedMovie(null);
                form.resetFields(); // Optional: clear form after submit
            } else {
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    return (
        <Modal
            title={formType === "add" ? "Thêm phim" : "Chỉnh sửa thông tin phim"}
            open={showMovieFormModal}
            onCancel={() => {
                setShowMovieFormModal(false);
                setSelectedMovie(null);
                form.resetFields();
            }}
            footer={null}
            width={800}
        >
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Movie Name" name="title" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Movie Description" name="description" rules={[{ required: true }]}>
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Movie Duration" name="duration" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Language" name="language" rules={[{ required: true }]}>
                            <Select placeholder="Chọn ngôn ngữ">
                                <Option value="English">Tiếng Anh</Option>
                                <Option value="Vietnamese">Tiếng Việt</Option>
                                <Option value="Chinese">Tiếng Trung</Option>
                                <Option value="Korean">Tiếng Hàn</Option>
                                <Option value="Thai">Tiếng Thái</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Movie Release Date" name="releaseDate" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Genre" name="genre" rules={[{ required: true }]}>
                            <Select placeholder="Chọn thể loại">
                                <Option value="Action">Hành động</Option>
                                <Option value="Comedy">Hài</Option>
                                <Option value="Drama">Drama</Option>
                                <Option value="Romance">Tình cảm</Option>
                                <Option value="Thriller">Giật gân</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={16}>
                        <Form.Item label="Poster URL" name="poster" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <div className='flex justify-end gap-1'>
                    <Button
                        title="Huỷ"
                        variant="outlined"
                        onClick={() => {
                            setShowMovieFormModal(false);
                            setSelectedMovie(null);
                            form.resetFields();
                        }}
                    />
                    <Button title="Lưu" type="submit" />
                </div>
            </Form>
        </Modal>
    );
}

export default MovieForm;
