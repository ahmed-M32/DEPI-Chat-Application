import { useMemo } from "react";

const useMergedChats = (activeChats) => {
	return useMemo(() => {
		const userChats = (activeChats?.userChats || []).map((c) => ({
			...c,
			isGroup: false,
		}));
		const userGroups = (activeChats?.userGroups || []).map((g) => ({
			...g,
			isGroup: true,
		}));
		const merged = [...userChats, ...userGroups];

		const getSortTime = (item) => {
			if (item.lastMessage?.createdAt)
				return new Date(item.lastMessage.createdAt).getTime();
			if (item.updatedAt) return new Date(item.updatedAt).getTime();
			return 0;
		};

		merged.sort((a, b) => getSortTime(b) - getSortTime(a));
		return merged;
	}, [activeChats]);
};

export default useMergedChats;
