const { axiosInstance } = require(".");

// lấy phim
export const AddMovie = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/movies/add-movie", payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}


// lấy tất phim
export const GetAllMovies = async () => {
    try {
        const response = await axiosInstance.get("/api/movies/get-all-movies");
        return response.data;
    } catch (error) {
        return error.response;
    }
}

//update phim
export const UpdateMovie = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/movies/update-movie", payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

// xoá phim
export const DeleteMovie = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/movies/delete-movie", payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}

//lấy id phim
export const GetMovieById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/movies/get-movie-by-id/${id}`);
        return response.data;
    } catch (error) {
        return error.response;
    }
}