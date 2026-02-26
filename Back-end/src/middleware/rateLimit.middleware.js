const createRateLimiter = ({ windowMs, max, message }) => {
	if (!global.__RATE_LIMIT_STORE__) {
		global.__RATE_LIMIT_STORE__ = new Map();

		// Cleanup old entries every 10 minutes to prevent memory leaks
		setInterval(() => {
			const now = Date.now();
			const store = global.__RATE_LIMIT_STORE__;
			let cleanedCount = 0;

			for (const [key, timestamps] of store.entries()) {
				const maxWindow = 60 * 60 * 1000; 
				const recentTimestamps = timestamps.filter(
					(timestamp) => timestamp > now - maxWindow
				);

				if (recentTimestamps.length === 0) {
					store.delete(key);
					cleanedCount++;
				} else {
					store.set(key, recentTimestamps);
				}
			}

			console.log(
				`[Rate Limiter] Cleanup complete. Removed ${cleanedCount} expired entries. Active entries: ${store.size}`
			);
		}, 10 * 60 * 1000); 

		console.log("[Rate Limiter] Initialized with automatic cleanup");
	}

	return (req, res, next) => {
		const now = Date.now();
		const windowStart = now - windowMs;
		const store = global.__RATE_LIMIT_STORE__;
		const key = `${req.ip}:${req.originalUrl}`;

		const entry = store.get(key) || [];

		const recentRequests = entry.filter((timestamp) => timestamp > windowStart);

		if (recentRequests.length >= max) {
			console.log(
				`[Rate Limiter] Blocked request from ${req.ip} to ${req.originalUrl} (${recentRequests.length}/${max})`
			);

			return res.status(429).json({
				success: false,
				message: message || "Too many requests, please try again later",
				retryAfter: Math.ceil(windowMs / 1000), // Seconds until they can try again
			});
		}

		recentRequests.push(now);
		store.set(key, recentRequests);

		res.setHeader("X-RateLimit-Limit", max);
		res.setHeader("X-RateLimit-Remaining", max - recentRequests.length);
		res.setHeader(
			"X-RateLimit-Reset",
			new Date(now + windowMs).toISOString()
		);

		next();
	};
};


export const registerRateLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000, 
	max: 10,
	message: "Too many signup attempts, please try again later",
});

export const loginRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000, 
	max: 10,
	message: "Too many login attempts, please try again later",
});

