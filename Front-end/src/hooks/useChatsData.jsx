import { useCallback, useState } from "react";
import { getChats } from "../api/message-api";

const useChatsData = () => {
	const [activeChats, setActiveChats] = useState({
		userChats: [],
		userGroups: [],
	});
	const [loading, setLoading] = useState(true);

	const fetchChats = useCallback(async () => {
		try {
			const response = await getChats();
			if (response.success) {
				setActiveChats(response.data.data);
			}
		} catch (err) {
			console.error("Failed to fetch chats:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	return { activeChats, setActiveChats, loading, fetchChats };
};

export default useChatsData;
