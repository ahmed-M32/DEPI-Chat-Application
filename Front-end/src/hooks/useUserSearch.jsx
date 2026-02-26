import { useEffect, useState } from "react";
import { searchUsers } from "../api/message-api";
import useDebouncedValue from "./useDebouncedValue";

const useUserSearch = ({ query, limit = 10, enabled = true, excludeUserId } = {}) => {
	const debouncedQuery = useDebouncedValue(query, 250);
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const q = (debouncedQuery || "").trim();
		if (!enabled || !q) {
			setResults([]);
			setLoading(false);
			return;
		}

		const run = async () => {
			setLoading(true);
			try {
				const res = await searchUsers(q, limit);
				if (cancelled) return;
				if (!res.success) {
					setResults([]);
					return;
				}

				const list = res.data?.data || [];
				const filtered = excludeUserId
					? list.filter((u) => u?._id && u._id !== excludeUserId)
					: list;
				setResults(filtered);
			} catch {
				if (!cancelled) setResults([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [debouncedQuery, enabled, excludeUserId, limit]);

	return { results, loading };
};

export default useUserSearch;
