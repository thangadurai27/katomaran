
const TINTS = {
    purple: {
        card: 'linear-gradient(135deg, #FAF7FF 0%, #F2EBFF 100%)',
        border: '#EEE5FF',
        iconBg: '#EDE2FF',
        icon: '#7C3AED',
        shadow: 'rgba(124, 58, 237, 0.06)',
    },
    blue: {
        card: 'linear-gradient(135deg, #F7FAFF 0%, #EDF4FF 100%)',
        border: '#E2EDFF',
        iconBg: '#DEEBFF',
        icon: '#3B82F6',
        shadow: 'rgba(59, 130, 246, 0.06)',
    },
    amber: {
        card: 'linear-gradient(135deg, #FFFBF4 0%, #FFF5E5 100%)',
        border: '#FDEBCB',
        iconBg: '#FFEEC9',
        icon: '#F59E0B',
        shadow: 'rgba(245, 158, 11, 0.06)',
    },
    green: {
        card: 'linear-gradient(135deg, #F6FDF9 0%, #EBFAF1 100%)',
        border: '#D9F3E2',
        iconBg: '#D8F6E4',
        icon: '#16A34A',
        shadow: 'rgba(22, 163, 74, 0.06)',
    },
    rose: {
        card: 'linear-gradient(135deg, #FFF8FA 0%, #FFEFF5 100%)',
        border: '#FBDCE7',
        iconBg: '#FBDCE7',
        icon: '#E11D74',
        shadow: 'rgba(225, 29, 116, 0.06)',
    },
};

const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    hint = 'vs. last 7 days',
    tint = 'purple',
    iconBg,
    iconColor,
    delay = 0,
    isLoading = false,
    className = '',
}) => {
    const tone = TINTS[tint] || TINTS.purple;
    const hasChange = change !== undefined && change !== null && Number.isFinite(Number(change));
    const changeValue = Number(change);
    const positive = changeValue >= 0;
    const displayValue =
        typeof value === 'number' ? new Intl.NumberFormat('en-US').format(value) : (value ?? 0);

    return (
        <div
            className={`stat-card-tint animate-in relative min-w-0 overflow-hidden rounded-2xl border p-4 sm:p-5 ${className}`}
            style={{
                background: tone.card,
                borderColor: tone.border,
                boxShadow: `0 1px 2px ${tone.shadow}, 0 10px 26px ${tone.shadow}`,
                animationDelay: `${delay}s`,
            }}
        >
            <div className="flex items-start gap-3.5 sm:gap-4">
                <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full sm:h-12 sm:w-12 ${iconBg || ''} ${iconColor || ''}`}
                    style={!iconBg && !iconColor ? { background: tone.iconBg, color: tone.icon } : undefined}
                >
                    {Icon ? <Icon className="h-5 w-5" strokeWidth={2} /> : null}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {label}
                    </p>

                    {isLoading ? (
                        <div className="skeleton mt-2 h-7 w-24 rounded-md" />
                    ) : (
                        <p className="mt-0.5 truncate font-display text-[26px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[28px]">
                            {displayValue}
                        </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {hasChange && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                                style={{
                                    color: positive ? '#15803D' : '#B91C1C',
                                    background: positive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.10)',
                                }}
                            >
                                <span aria-hidden>{positive ? '↑' : '↓'}</span>
                                {Math.abs(changeValue)}%
                            </span>
                        )}
                        {hint && (
                            <span className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                {hint}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
