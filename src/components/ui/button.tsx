export default function Button({
    children,
    onClick,
    disabled,
    className,
    ...props
}: Readonly<{
    children: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    className?: string;
}>) {
    return (
        <button
            className={
                "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " +
                className
            }
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}