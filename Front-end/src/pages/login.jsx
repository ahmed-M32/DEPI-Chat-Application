import React from "react";
import { useState } from "react";



const LoginPage = ()=> {
	const [email,setEmail] = useState("");
	const [password, setPassword] = useState("");


	return(
		
		
			<form>
				<div className="email">
		<label htmlFor="email">email</label>
					<input type="email" value="email"/> 
				</div>
			</form>
		
	)
}


export default LoginPage;
