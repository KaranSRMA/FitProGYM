import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Calendar, Award, Activity, Bell, UserCheck, UserX } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router';

const revenueData = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 14200 },
    { month: 'Mar', revenue: 13800 },
    { month: 'Apr', revenue: 15600 },
    { month: 'May', revenue: 17200 },
    { month: 'Jun', revenue: 18900 },
];

const attendanceData = [
    { day: 'Mon', count: 145 },
    { day: 'Tue', count: 132 },
    { day: 'Wed', count: 158 },
    { day: 'Thu', count: 141 },
    { day: 'Fri', count: 167 },
    { day: 'Sat', count: 189 },
    { day: 'Sun', count: 123 },
];

const stats = [
    {
        title: 'Total Members',
        value: '1,247',
        change: '+12.5%',
        icon: Users,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    {
        title: 'Monthly Revenue',
        value: '$18,900',
        change: '+8.2%',
        icon: DollarSign,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    {
        title: 'Active Trainers',
        value: '24',
        change: '+2',
        icon: Award,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
    },
    {
        title: 'Today\'s Check-ins',
        value: '167',
        change: '+5.3%',
        icon: Activity,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
    },
];

const recentMembers = [
    { id: 1, name: 'Sarah Johnson', membership: 'Premium', joinDate: '2024-12-10', status: 'active' },
    { id: 2, name: 'Mike Chen', membership: 'Basic', joinDate: '2024-12-09', status: 'active' },
    { id: 3, name: 'Emma Wilson', membership: 'Standard', joinDate: '2024-12-08', status: 'active' },
    { id: 4, name: 'James Brown', membership: 'Premium', joinDate: '2024-12-07', status: 'active' },
];

const membershipDistribution = [
    { name: 'Premium', value: 485, color: '#ef4444' },
    { name: 'Standard', value: 423, color: '#3b82f6' },
    { name: 'Basic', value: 339, color: '#10b981' },
];



export function AdminDashboard() {
    return (
        <div className="min-h-screen bg-zinc-950 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-white mb-2 text-2xl">Admin Dashboard</h1>
                    <p className="text-zinc-400">Welcome back! Here's what's happening with your gym today.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="bg-zinc-900 border-zinc-800 rounded-xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                                <Icon className={`size-6 ${stat.color}`} />
                                            </div>
                                            <span className="text-green-500 text-sm">{stat.change}</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm mb-1">{stat.title}</p>
                                        <h2 className="text-white">{stat.value}</h2>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 rounded-xl p-6">
                            <div>
                                <h2 className="text-white">Revenue Overview</h2>
                                <p className="text-zinc-400">Monthly revenue for the last 6 months</p>
                            </div>
                            <div>
                                <div className='pt-8'>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis dataKey="month" stroke="#71717a" />
                                            <YAxis stroke="#71717a" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#18181b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                }}
                                            />
                                            <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Attendance Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="bg-zinc-900 border-zinc-800 rounded-xl p-6">
                            <div>
                                <h2 className="text-white">Weekly Attendance</h2>
                                <p className="text-zinc-400">Member check-ins this week</p>
                            </div>
                            <div>
                                <div className='pt-8'>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis dataKey="day" stroke="#71717a" />
                                            <YAxis stroke="#71717a" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#18181b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                }}
                                            />
                                            <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Members Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="bg-zinc-900 border-zinc-800 rounded-xl p-6">
                        <div>
                            <h2 className="text-white">Recent Members</h2>
                            <p className="text-zinc-400">Newest members who joined your gym</p>
                        </div>
                        <div>
                            <div className="overflow-x-auto pt-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="text-left py-3 px-4 text-zinc-400">Name</th>
                                            <th className="text-left py-3 px-4 text-zinc-400">Membership</th>
                                            <th className="text-left py-3 px-4 text-zinc-400">Join Date</th>
                                            <th className="text-left py-3 px-4 text-zinc-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentMembers.map((member) => (
                                            <tr key={member.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                                <td className="py-3 px-4 text-white">{member.name}</td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-red-500/10 text-red-500">
                                                        {member.membership}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-zinc-400">{member.joinDate}</td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-500">
                                                        {member.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Membership Distribution Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="bg-zinc-900 border-zinc-800 rounded-xl p-6 my-8">
                        <div>
                            <h2 className="text-white">Membership Distribution</h2>
                            <p className="text-zinc-400">Current membership types</p>
                        </div>
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={membershipDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {membershipDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}