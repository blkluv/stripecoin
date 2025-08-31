export default function LogoMark({ small = false }: { small?: boolean }) {
    return (
        <svg viewBox="0 0 64 64" className={small ? "size-5" : "size-7"} role="img" aria-label="logo">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#g)" opacity="0.9" />
            <path d="M22 36c4 4 8 4 12 0s8-4 12 0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
    );
}