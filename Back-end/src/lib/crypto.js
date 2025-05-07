import { log } from 'console';
import crypto from 'crypto';



const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV_LENGTH = 12;




export function encrypt(text) {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');


	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag();


	return {
		iv: iv.toString('hex'),
		encryptedData: encrypted,
		authTag: authTag.toString('hex')
	};


}

export function decrypt({ encryptedData, iv, authTag }) {

	if (encryptedData == "" || iv== ""|| authTag == "") {
		console.log("Missing parameters for decryption");
		
		return "";
	}
	console.log('Input values:', { encryptedData, iv, authTag });
	const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));


	decipher.setAuthTag(Buffer.from(authTag, 'hex'));
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');



	return decrypted + decipher.final('utf8');
}


