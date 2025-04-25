import React from "react";







const Signup = () => {



	return (
		<form>	
			<div className="user-name">
				<label htmlFor="username">Username</label>
				<input type="text" id = "username" placeholder="username"/>
	
			</div>
			<div>
				<label htmlFor="email">E-Mail</label>
				<input type="email" id="email" placeholder="email"/>

		

			</div>

		</form>
	)
}
