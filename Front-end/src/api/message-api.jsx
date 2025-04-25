/* eslint-disable no-unused-vars */
import axios from "axios";

/*export const getMessages = async (conversationId) => {
	return axios
		.get(`http://localhost:5000/api/message/${conversationId}`, {
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
*/
export const getUsers = async () => {
	return axios
		.get("http://localhost:5000/api/message/get-users", {
			withCredentials: true,
		})
		.then((res) => {
			return {
				success: true,
				data: res.data,
			};
		})
		.catch((error) => {
			return {
				success: false,
				code: error.response.status,
			};
		});
};

export const getChats = async () => {
	return axios
		.get("http://localhost:5000/api/message/chat", { withCredentials: true })
		.then((res) => {
			return {
				success: true,
				data: res.data,
			};
		})
		.catch((error) => {
			return {
				success: false,
				code: error.response.status,
			};
		});
};

export const createNewChat = async (id) => {
	const data = {
		member: id,
	};

	return axios
		.post("http://localhost:5000/api/message/add-chat",data, {
			withCredentials: true,
		})
		.then((res) => {
			return {
				success: true,
				chatId: res.data,
			};
		})
		.catch((error) => {
			return {
				success: false,
				code: error.response.status,
			};
		});
};
