/* eslint-disable no-unused-vars */
import axios from "axios";



export const signup = async (data) => {
	return axios
		.post("http://localhost:5000/api/auth/signup", data, {
			withCredentials: true,
		})
		.then((res) => {
			console.log("sign up successfully", res.data);
			return {
				success: true,
				data: res.data,
			};
		})
		.catch((error) => {
			if (error.response) {
				return {
					success: false,
					code: error.response.status,
				};
			}
		});
};

export const login = async (data) => {
	return axios
		.post("http://localhost:5000/api/auth/login", data, {
			withCredentials: true,
		})
		.then((res) => {
			return {
				success: true,
				data: res.data,
			};
		})
		.catch((error) => {
			if (error.response) {
				return {
					success: false,
					code: error.response.status,
				};
			}
		});
};
