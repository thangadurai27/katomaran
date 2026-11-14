export const Container = ({ maxW, className, children }) => {
    return (
        <div maxW={maxW} className={className}>
            {children}
        </div>
    );
};