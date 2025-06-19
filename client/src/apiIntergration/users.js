const {axiosInstance} = require(".");

// đăng kí user mới
export const RegisterUser = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/users/register", payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

// đăng nhập user
export const LoginUser = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/users/login", payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

// lấy user hiện tại
export const GetCurrentUser = async function (params) {
    try {
        const response = await axiosInstance.get("/api/users/get-current-user");
        return response.data;
    } catch (error) {
        return error;
    }
}