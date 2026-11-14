import React from 'react';

const Input = ({ type, placeholder, value, onChange, ...props }) => {
    return (
        <input
            type={type || 'text'}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="input-field rounded-lg focus:outline-none focus:border-primary w-full py-2 pr-8"
        />
    );
};

Input.defaultProps = {
    type: 'text',
};

export default Input;