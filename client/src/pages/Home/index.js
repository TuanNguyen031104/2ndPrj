import React, { useEffect } from "react";
import { Col, message, Row, Table } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { useNavigate } from "react-router-dom";
import { GetAllMovies } from "../../apiIntergration/movies";
import moment from "moment";

function Home() {
    const [searchText = "", setSearchText] = React.useState("");
    const [movies, setMovies] = React.useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const getData = async () => {
        try {
            dispatch(ShowLoading());
            const response = await GetAllMovies();
            if (response.success) {
                setMovies(response.data);
            } else {
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    useEffect(() => {
        getData();
    }, []);
    return (
        <div>
            <input
                type="text"
                className="search-input"
                placeholder="Search for movies"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />

            <Row gutter={[20]} className="mt-2">
                {movies
                    .filter((movie) => movie.title.toLowerCase().includes(searchText.toLowerCase()))
                    .map((movie) => (
                        <Col span={6} key={movie._id}> {/* Thêm key cho Col */}
                            <div
                                className="card flex flex-col gap-1 cursor-pointer movie-card" // Thêm class 'movie-card'
                                onClick={() => navigate(`/movie/${movie._id}?date=${moment().format("YYYY-MM-DD")}`)}
                            >
                                <div className="poster-container"> {/* Thêm vùng chứa cho poster */}
                                    <img src={movie.poster} alt={movie.title} /> {/* Bỏ height ở đây */}
                                </div>
                                <div className="flex justify-center p-1">
                                    <h1 className="text-md uppercase">{movie.title}</h1>
                                </div>
                            </div>
                        </Col>
                    ))}
            </Row>
        </div>
    );
}

export default Home;