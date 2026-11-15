import {
    Home,
    Plus,
    Link2,
    BarChart3,
    Sparkles,
    Activity,
    QrCode,
    Layers,
    Megaphone,
    Users,
    Bell,
    User,
    Settings,
    Trash2,
} from 'lucide-react';

export const navigationGroups = [
    {
        label: 'Main',
        items: [
            { label: 'Overview', icon: Home, path: '/dashboard/overview' },
            { label: 'Create Link', icon: Plus, path: '/dashboard/create-link' },
            { label: 'My Links', icon: Link2, path: '/dashboard/links' },
        ],
    },
    {
        label: 'Analytics & Intelligence',
        items: [
            { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
            { label: 'AI Insights', icon: Sparkles, path: '/dashboard/ai-insights' },
            { label: 'Activity Logs', icon: Activity, path: '/dashboard/activity-logs' },
        ],
    },
    {
        label: 'Tools',
        items: [
            { label: 'QR Center', icon: QrCode, path: '/dashboard/qr-center' },
            { label: 'Bulk Shortener', icon: Layers, path: '/dashboard/bulk-shortener' },
            { label: 'Campaigns', icon: Megaphone, path: '/dashboard/campaigns' },

        ],
    },
    {
        label: 'Management',
        items: [
            { label: 'Team', icon: Users, path: '/dashboard/team' },
            { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
        ],
    },
    {
        label: 'Account',
        items: [
            { label: 'Profile', icon: User, path: '/dashboard/profile' },
            { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
            { label: 'Trash', icon: Trash2, path: '/dashboard/trash' },
        ],
    },
];

export default navigationGroups;