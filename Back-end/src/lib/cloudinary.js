import { v2 } from "cloudinary";
import { config } from "dotenv";

config();

v2.config({
	cloud_name: process.env.CLOUDINARY_USERNAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default v2;
