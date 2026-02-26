/* eslint-disable react/prop-types */
import React from "react";
import styles from "./InputField.module.css";

/**
 * Reusable text input for search and message input.
 * Supports leading icon, placeholder, aria-labels, and optional clear button.
 */
const InputField = ({
	type = "text",
	value,
	onChange,
	onSubmit,
	placeholder,
	disabled,
	className = "",
	ariaLabel,
	ariaDescribedBy,
	id,
	leadingIcon,
	trailingButton,
	multiline = false,
	rows = 1,
	inputRef,
	...rest
}) => {
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey && onSubmit) {
			e.preventDefault();
			onSubmit(e);
		}
	};

	const inputProps = {
		id,
		type: multiline ? undefined : type,
		value,
		onChange: (e) => onChange?.(e.target.value),
		placeholder,
		disabled,
		"aria-label": ariaLabel || placeholder,
		"aria-describedby": ariaDescribedBy,
		className: styles.input,
		onKeyDown: handleKeyDown,
		ref: inputRef,
		...rest,
	};

	return (
		<div className={`${styles.wrapper} ${className}`.trim()}>
			{leadingIcon && <span className={styles.leadingIcon} aria-hidden>{leadingIcon}</span>}
			{multiline ? (
				<textarea
					{...inputProps}
					rows={rows}
					className={`${styles.input} ${styles.textarea}`}
				/>
			) : (
				<input {...inputProps} />
			)}
			{trailingButton && <span className={styles.trailing}>{trailingButton}</span>}
		</div>
	);
};

export default InputField;
