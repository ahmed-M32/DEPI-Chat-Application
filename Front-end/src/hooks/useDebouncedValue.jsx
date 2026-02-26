import { useEffect, useState } from "react";

const useDebouncedValue = (value, delayMs = 250) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedValue(value), delayMs);
		return () => clearTimeout(t);
	}, [value, delayMs]);

	return debouncedValue;
};

export default useDebouncedValue;
