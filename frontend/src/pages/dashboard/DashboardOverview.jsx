import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Link2,
    MousePointerClick,
    Users,
    Sparkles,
    CalendarDays,
    ChevronDown,
    ArrowRight,
    ArrowUpRight,
    TrendingUp,
    Copy,
    MoreHorizontal,
    BarChart3,
    Smartphone,
    Plus,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { SHORT_URL_BASE } from '@/config/env';
import useAuthStore from '@/stores/authStore';
import { StatCard } from '@/components/ui';
import ResponsiveChart from '@/components/ui/ResponsiveChart';

const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const formatNumber = (value) => numberFormat.format(Number(value) || 0);
const formatCompact = (value) => {
    const n = Number(value) || 0;
    return n >= 10000 ? compactFormat.format(n) : numberFormat.format(n);
};

const formatAxis = (value) => {
    const n = Number(value) || 0;
    return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `${n}`;
};

const DEVICE_META = [
    { key: 'mobile', label: 'Mobile', color: '#7C3AED' },
    { key: 'desktop', label: 'Desktop', color: '#A78BFA' },
    { key: 'tablet', label: 'Tablet', color: '#D8CCFB' },
    { key: 'other', label: 'Other', color: '#DEDDE9' },
];

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-[#EEE9FA] bg-white px-3.5 py-2.5 shadow-[0_10px_30px_rgba(29,27,51,0.12)]">
            <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                {formatNumber(payload[0].value)} clicks
            </p>
        </div>
    );
};

const DashboardOverview = () => {
    const { user } = useAuthStore();
    const [range, setRange] = useState(7);
    const [mountedAt] = useState(() => Date.now());

    const {
        data: statsData,
        isLoading: isLoadingStats,
        isError: isStatsError,
        refetch: refetchStats,
    } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get('/links/stats/overview');
            return data.data;
        },
    });

    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
        isError: isAnalyticsError,
        refetch: refetchAnalytics,
    } = useQuery({
        queryKey: ['analytics-overview', range],
        queryFn: async () => {
            const { data } = await api.get(`/analytics/overview?days=${range}`);
            return data.data;
        },
    });

    const stats = statsData || {};
    const analytics = analyticsData || {};
    const recentLinks = stats.recentLinks || [];

    const totalLinks = Number(stats.totalLinks) || 0;
    const activeLinks = Number(stats.activeLinks) || 0;
    const totalClicks = Number(stats.totalClicks) || 0;
    const uniqueClicks = Number(analytics.uniqueClicks) || 0;
    const clickGrowth = Number(stats.clickGrowth) || 0;

    const aiScore = useMemo(() => {
        if (!totalLinks) return 0;
        const activeRatio = activeLinks / totalLinks;
        const uniqueRatio = totalClicks > 0 ? Math.min(1, uniqueClicks / totalClicks) : 0;
        const growthRatio = Math.min(1, Math.max(0, clickGrowth) / 100);
        return Math.round(Math.min(100, activeRatio * 52 + uniqueRatio * 28 + growthRatio * 20));
    }, [activeLinks, totalLinks, totalClicks, uniqueClicks, clickGrowth]);

    const chartData = useMemo(() => {
        const byDate = new Map(
            (analytics.dailyClicks || []).map((entry) => [
                entry._id,
                Number(entry.clicks ?? entry.count) || 0,
            ])
        );

        return Array.from({ length: range }, (_, index) => {
            const date = subDays(new Date(), range - 1 - index);
            const key = format(date, 'yyyy-MM-dd');
            return {
                key,
                label: format(date, range <= 7 ? 'EEE' : 'MMM d'),
                clicks: byDate.get(key) || 0,
            };
        });
    }, [analytics.dailyClicks, range]);

    const hasChartData = chartData.some((entry) => entry.clicks > 0);

    const devices = useMemo(() => {
        const grouped = { mobile: 0, desktop: 0, tablet: 0, other: 0 };

        (analytics.deviceStats || []).forEach((entry) => {
            const key = ['mobile', 'desktop', 'tablet'].includes(entry._id) ? entry._id : 'other';
            grouped[key] += Number(entry.count) || 0;
        });

        const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

        return {
            total,
            rows: DEVICE_META.map((meta) => ({
                ...meta,
                value: grouped[meta.key],
                percent: total > 0 ? Math.round((grouped[meta.key] / total) * 100) : 0,
            })),
        };
    }, [analytics.deviceStats]);

    const pieData = devices.rows.filter((device) => device.value > 0);
    const deviceCenterValue = formatCompact(devices.total || Number(analytics.totalClicks) || 0);

    const firstName = user?.name?.split(' ')[0] || 'there';
    const growthLabel = Math.abs(clickGrowth).toFixed(clickGrowth % 1 === 0 ? 0 : 1);
    const insightTitle =
        totalClicks === 0
            ? 'Your first insight is on the way'
            : clickGrowth > 0
                ? `Engagement is up ${growthLabel}%`
                : clickGrowth < 0
                    ? `Clicks are down ${growthLabel}%`
                    : 'Steady engagement this week';

    const insightBody =
        totalClicks === 0
            ? 'Create and share your first link. AI Insights will start spotting trends as soon as the clicks come in.'
            : clickGrowth > 0
                ? `Your links received ${growthLabel}% more clicks than last week. Keep the momentum going!`
                : clickGrowth < 0
                    ? 'A few of your links slowed down this week. Refresh your top campaigns to bring traffic back up.'
                    : 'Your click volume is holding steady. Try sharing a link with a new audience to spark growth.';

    const copyShortLink = async (shortCode) => {
        try {
            await navigator.clipboard.writeText(`${SHORT_URL_BASE}${shortCode}`);
            toast.success('Short link copied');
        } catch {
            toast.error('Could not copy link');
        }
    };

    const rawShortHost = SHORT_URL_BASE.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\/r$/, '');
    const shortHost = /^(localhost|127\.0\.0\.1|\[::1\])/i.test(rawShortHost)
        ? 'snaplink.ai'
        : rawShortHost;

    return (
        <div className="animate-in space-y-6">
            {/* Welcome */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="flex items-center gap-2.5 font-display text-[26px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[32px]">
                        <span aria-hidden className="text-[26px] sm:text-[30px]">👋</span>
                        <span className="truncate">Welcome back, {firstName}!</span>
                    </h1>
                    <p className="mt-1.5 text-[14px] text-[var(--text-secondary)] sm:text-[15px]">
                        Here&rsquo;s what&rsquo;s happening with your links today.
                    </p>
                </div>

                <Link
                    to="/dashboard/create-link"
                    className="btn-primary h-11 w-full shrink-0 gap-2 px-5 text-sm sm:w-auto"
                >
                    <Link2 className="h-4 w-4" /> Create Link
                </Link>
            </div>

            {/* Data error banner */}
            {(isStatsError || isAnalyticsError) && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
                >
                    <span>
                        Some dashboard data couldn&rsquo;t be loaded. Showing the data we have.
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            if (isStatsError) refetchStats();
                            if (isAnalyticsError) refetchAnalytics();
                        }}
                        className="shrink-0 self-start rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 sm:self-auto dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/70"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                <StatCard
                    icon={Link2}
                    label="Total Links"
                    value={formatCompact(totalLinks)}
                    hint={totalLinks ? `${formatNumber(activeLinks)} active` : 'Create your first link'}
                    tint="purple"
                    delay={0}
                    isLoading={isLoadingStats}
                />
                <StatCard
                    icon={MousePointerClick}
                    label="Total Clicks"
                    value={formatCompact(totalClicks)}
                    change={statsData ? clickGrowth : undefined}
                    hint="vs. last 7 days"
                    tint="blue"
                    delay={0.06}
                    isLoading={isLoadingStats}
                />
                <StatCard
                    icon={Users}
                    label="Unique Clicks"
                    value={formatCompact(uniqueClicks)}
                    hint={`Last ${range} days`}
                    tint="amber"
                    delay={0.12}
                    isLoading={isLoadingAnalytics}
                />
                <StatCard
                    icon={Sparkles}
                    label="AI Score"
                    value={`${aiScore}%`}
                    hint="Link health & engagement"
                    tint="green"
                    delay={0.18}
                    isLoading={isLoadingStats || isLoadingAnalytics}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)]">
                {/* Click performance */}
                <section className="card min-w-0 overflow-hidden">
                    <div className="flex flex-col gap-4 p-5 pb-0 sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pb-0">
                        <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAFF] text-[#7C3AED]">
                                <BarChart3 className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                                    Click Performance
                                </h2>
                                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                                    Total clicks over the last {range} days
                                </p>
                            </div>
                        </div>

                        <div className="relative shrink-0">
                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-secondary)]" />
                            <select
                                value={range}
                                onChange={(event) => setRange(Number(event.target.value))}
                                className="h-9 cursor-pointer appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] pl-9 pr-8 text-[12px] font-semibold text-[var(--text-secondary)] outline-none transition-colors hover:border-[#D8C7FF] focus:border-[#B794FF] focus:ring-4 focus:ring-[#7C3AED]/[0.08]"
                                aria-label="Select chart period"
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last 30 Days</option>
                                <option value={90}>Last 90 Days</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-secondary)]" />
                        </div>
                    </div>

                    <div className="px-2 pb-4 pt-2 sm:px-3 sm:pb-5">
                        {isLoadingAnalytics ? (
                            <div className="skeleton mx-3 mt-3 h-[250px] rounded-xl" />
                        ) : hasChartData ? (
                            <ResponsiveChart height={212} mobileHeight={190}>
                                <AreaChart data={chartData} margin={{ top: 26, right: 14, left: -8, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="clickPerformanceFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.26} />
                                            <stop offset="70%" stopColor="#8B5CF6" stopOpacity={0.06} />
                                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#8E8AA3', fontSize: 11 }}
                                        dy={8}
                                        interval={range > 30 ? 'preserveStartEnd' : 0}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        width={46}
                                        allowDecimals={false}
                                        tick={{ fill: '#8E8AA3', fontSize: 11 }}
                                        tickFormatter={formatAxis}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D8CCFB', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#7C3AED"
                                        strokeWidth={2.5}
                                        fill="url(#clickPerformanceFill)"
                                        dot={{ r: 4, fill: '#FFFFFF', stroke: '#7C3AED', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveChart>
                        ) : isAnalyticsError ? (
                            <div className="mx-3 mt-3 flex h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
                                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                                    <BarChart3 className="h-6 w-6" />
                                </span>
                                <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                                    Analytics temporarily unavailable
                                </p>
                                <p className="mt-1 max-w-[260px] text-xs text-[var(--text-muted)]">
                                    We couldn&rsquo;t reach the analytics service. Try again in a moment.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => refetchAnalytics()}
                                    className="btn-secondary mt-4 px-3 py-2 text-xs"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="mx-3 mt-3 flex h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-[#EBE6F6] bg-[#FBFAFE] dark:border-[#332a4d] dark:bg-[#1a1628]">
                                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2EAFF] text-[#7C3AED]">
                                    <BarChart3 className="h-6 w-6" />
                                </span>
                                <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">No clicks yet</p>
                                <p className="mt-1 max-w-[260px] text-center text-xs text-[var(--text-muted)]">
                                    Share a link and your click performance will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Devices */}
                <section className="card flex min-w-0 flex-col p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAFF] text-[#7C3AED]">
                            <Smartphone className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="font-display text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                                Devices
                            </h2>
                            <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Traffic by device type</p>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row sm:gap-4">
                        <div className="relative h-[148px] w-[148px] shrink-0">
                            {pieData.length > 0 ? (
                                <PieChart width={148} height={148}>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={49}
                                        outerRadius={68}
                                        paddingAngle={2}
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="none"
                                    >
                                        {pieData.map((device) => (
                                            <Cell key={device.key} fill={device.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            ) : (
                                <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
                                    <circle cx="50" cy="50" r="43" fill="none" stroke="#F2EFF9" strokeWidth="15" />
                                </svg>
                            )}

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-display text-[20px] font-extrabold leading-none text-[var(--text-primary)]">
                                    {deviceCenterValue}
                                </span>
                                <span className="mt-1 text-[10px] font-medium text-[var(--text-muted)]">Clicks</span>
                            </div>
                        </div>

                        <div className="w-full min-w-0 flex-1 space-y-3">
                            {devices.rows.map((device) => (
                                <div key={device.key} className="flex items-center gap-2.5">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ background: device.color }}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text-secondary)]">
                                        {device.label}
                                    </span>
                                    <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                                        {device.percent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {devices.total === 0 && (
                        <p className="mt-4 text-center text-[11px] text-[var(--text-muted)]">
                            Device data appears after your first click.
                        </p>
                    )}
                </section>
            </div>

            {/* Recent links + AI insight */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)]">
                <section className="card min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-6">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAFF] text-[#7C3AED]">
                                <Link2 className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-display text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                                    Recent Links
                                </h2>
                                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Your latest created links</p>
                            </div>
                        </div>

                        <Link
                            to="/dashboard/links"
                            className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-hover)]"
                        >
                            View All <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {isLoadingStats ? (
                        <div className="divide-y divide-[var(--border)]">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                                    <div className="skeleton h-7 w-28 rounded-md" />
                                    <div className="skeleton h-3 w-44 rounded" />
                                    <div className="ml-auto skeleton h-4 w-10 rounded" />
                                    <div className="skeleton h-5 w-14 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : recentLinks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[#FBFAFE] dark:bg-[#1a1628]">
                                        {['Short Link', 'Original URL', 'Clicks', 'Created', 'Status', ''].map(
                                            (heading, index) => (
                                                <th
                                                    key={`${heading}-${index}`}
                                                    className="whitespace-nowrap px-5 py-3 text-[12px] font-semibold text-[var(--text-secondary)] first:pl-6 last:pr-6 sm:px-4"
                                                >
                                                    {heading}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLinks.slice(0, 5).map((link) => {
                                        const expired =
                                            link.expiresAt && new Date(link.expiresAt).getTime() < mountedAt;
                                        const status = expired ? 'Expired' : link.isActive ? 'Active' : 'Inactive';

                                        return (
                                            <tr
                                                key={link._id}
                                                className="group border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[#FBFAFE] dark:hover:bg-[#1a1628]"
                                            >
                                                <td className="py-3.5 pl-6 pr-4">
                                                    <div className="inline-flex max-w-[190px] items-center gap-1.5 rounded-md bg-[#F5F0FF] px-2 py-1">
                                                        <span className="truncate font-mono text-[11px] font-medium text-[#7C3AED]">
                                                            {shortHost}/{link.shortCode}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyShortLink(link.shortCode)}
                                                            className="shrink-0 text-[#A78BFA] transition-colors hover:text-[#6D28D9]"
                                                            aria-label="Copy short link"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="max-w-[240px] px-4 py-3.5">
                                                    <span
                                                        className="block truncate text-[12.5px] text-[var(--text-secondary)]"
                                                        title={link.title || link.originalUrl}
                                                    >
                                                        {link.originalUrl}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                                                    {formatNumber(link.stats?.totalClicks || 0)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-[var(--text-muted)]">
                                                    {link.createdAt
                                                        ? formatDistanceToNow(new Date(link.createdAt), {
                                                              addSuffix: true,
                                                          })
                                                        : '—'}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3.5">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                                                        style={
                                                            status === 'Active'
                                                                ? { background: '#EAFBF1', color: '#15803D' }
                                                                : status === 'Expired'
                                                                    ? { background: '#FEF2F2', color: '#B91C1C' }
                                                                    : { background: '#F4F3F8', color: '#6B6880' }
                                                        }
                                                    >
                                                        <span
                                                            className="h-1.5 w-1.5 rounded-full"
                                                            style={{
                                                                background:
                                                                    status === 'Active'
                                                                        ? '#22C55E'
                                                                        : status === 'Expired'
                                                                            ? '#EF4444'
                                                                            : '#A1A0B2',
                                                            }}
                                                        />
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pl-2 pr-6">
                                                    <Link
                                                        to={`/dashboard/link/${link._id}`}
                                                        className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                                                        aria-label="Open link details"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F5F0FF] text-[#7C3AED]">
                                <Link2 className="h-7 w-7" />
                            </span>
                            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">No links yet</p>
                            <p className="mt-1 max-w-xs text-xs text-[var(--text-muted)]">
                                Create your first short link to see it show up here.
                            </p>
                            <Link to="/dashboard/create-link" className="btn-primary mt-5 gap-1.5 px-4 py-2.5 text-xs">
                                <Plus className="h-4 w-4" /> Create Link
                            </Link>
                        </div>
                    )}
                </section>

                {/* AI insight */}
                <section className="card flex min-w-0 flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAFF] text-[#7C3AED]">
                                <Sparkles className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                                    AI Insights
                                </h2>
                                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Smart tips for your links</p>
                            </div>
                        </div>
                        <Link
                            to="/dashboard/ai-insights"
                            className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-hover)]"
                        >
                            View All <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="mt-5 flex flex-1 flex-col justify-center rounded-2xl border border-[#F0E8FF] bg-gradient-to-br from-[#FAF7FF] to-[#F4EDFF] p-5 dark:border-[#3a2a5c] dark:from-[#211a35] dark:to-[#2a2142]">
                        <div className="flex items-start gap-3.5">
                            <span
                                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                                    clickGrowth >= 0 ? 'bg-white text-[#7C3AED]' : 'bg-white text-[#E11D74]'
                                } shadow-[0_4px_14px_rgba(124,58,237,0.10)]`}
                            >
                                <TrendingUp
                                    className={`h-5 w-5 ${clickGrowth < 0 ? 'rotate-180' : ''}`}
                                    strokeWidth={2.2}
                                />
                            </span>
                            <div className="min-w-0">
                                <h3 className="font-display text-[16px] font-bold leading-snug text-[var(--text-primary)]">
                                    {insightTitle}
                                </h3>
                                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                                    {insightBody}
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/dashboard/ai-insights"
                            className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-[#7C3AED] transition-colors hover:bg-white dark:bg-white/10 dark:text-[#C4B5FD] dark:hover:bg-white/15"
                        >
                            Explore AI report <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--border)] px-3.5 py-2.5">
                        <span className="text-[11px] font-medium text-[var(--text-muted)]">AI performance score</span>
                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-primary)]">
                            <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
                            {aiScore}/100
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardOverview;
