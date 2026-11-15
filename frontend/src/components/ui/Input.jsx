
const Input = ({ type, placeholder, className: inputClassName, ...props }) => {
    return (
        <input
            type={type || 'text'}
            placeholder={placeholder}
            {...props}
            className={`input-field rounded-lg focus:outline-none focus:border-primary w-full py-2 pr-8 ${inputClassName || ''}`.trim()}
        />
    );
};

Input.defaultProps = {
    type: 'text',
};

export default Input;