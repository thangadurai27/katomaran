import React from 'react';

const Button = ({ type, children, onClick, className: buttonClassName, ...props }) => {
    const defaultClassName = 'btn-primary py-2 rounded-lg';
    const fullClassName = [defaultClassName, buttonClassName].filter(Boolean).join(' ').trim();
    
    return (
        <button
            type={type}
            onClick={onClick}
            className={fullClassName}
        >
            {children}
        </button>
    );
};

Button.defaultProps = {
    type: 'button',
};

export default Button;