'use client';

import styles from './FormInput.module.css';

export default function FormInput({ type, value, onChange, placeholder, required, disabled, name }) {
  const handleInputChange = (e) => {
    console.log('FormInput onChange:', name, e.target.value);
    onChange(e);
  };

  return (
    <div className={styles.inputWrapper}>
      <input
        className={`${styles.formInput} ${disabled ? styles.disabled : ''}`}
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}