import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? 'http://localhost:5000/api' : "/api",
    withCredentials: true,
    timeout: 15000,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            toast.error("Yêu cầu quá thời hạn. Vui lòng thử lại.");
        } else if (error.response) {
            const status = error.response.status;
            if (status === 429) {
                toast.error(error.response.data.message || "Gửi yêu cầu quá nhanh. Vui lòng thử lại sau.");
            } else if (status === 401) {
                if (!error.config.url.includes('/auth/check')) {
                    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                }
            } else if (status >= 500) {
                toast.error("Máy chủ gặp lỗi. Vui lòng thử lại sau.");
            }
        } else if (error.request) {
            toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;