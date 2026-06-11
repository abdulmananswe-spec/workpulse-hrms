"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ClipboardList,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import type { DashboardMetrics } from "@/lib/dashboard/queries";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

type ExecutiveDashboardProps = {
  metrics: DashboardMetrics;
};

export function ExecutiveDashboard({ metrics }: ExecutiveDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total Employees" value={metrics.totalEmployees} icon={Users} gradient="from-blue-500 to-blue-700" change={4.2} changeLabel="vs last month" />
        <KpiCard label="Present Today" value={metrics.presentToday} icon={UserCheck} gradient="from-emerald-500 to-teal-600" change={2.1} changeLabel="vs yesterday" />
        <KpiCard label="Absent Today" value={metrics.absentToday} icon={UserX} gradient="from-rose-500 to-red-600" change={-1.4} changeLabel="vs yesterday" />
        <KpiCard label="On Leave" value={metrics.onLeave} icon={CalendarClock} gradient="from-violet-500 to-purple-600" />
        <KpiCard label="Pending Requests" value={metrics.pendingRequests} icon={ClipboardList} gradient="from-amber-500 to-orange-600" />
        <KpiCard label="Branches" value={metrics.totalBranches} icon={Building2} gradient="from-cyan-500 to-blue-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attendance Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Last 7 days overview</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.attendanceTrend}>
                <defs>
                  <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="present" stroke="#2563EB" fill="url(#presentFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">By branch</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.branchDistribution} dataKey="employees" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {metrics.branchDistribution.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Leave Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly leave activity</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" fill="#EF4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/dashboard/attendance" className="text-xs font-medium text-primary">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                metrics.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/dashboard/leaves?tab=pending">
                  Review pending leaves
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/dashboard/employees">
                  Manage employees
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/dashboard/attendance">
                  View attendance
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
