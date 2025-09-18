// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  FileText,
  Settings,
  Database,
  Shield,
  Activity,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { adminService } from '@/services/adminService';
import { dateHelpers, numberHelpers } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const loadAdminDashboard = async () => {
    setIsLoading(true);
    
    try {
      const response = await adminService.getDashboardOverview();
      
      if (response.success) {
        const data = response.data;
        setDashboardData(data.overview);
        setSystemHealth(data.systemHealth);
        setRecentActivity(data.recentActivity || []);
        setPendingActions(data.pendingActions || []);
      }
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen text={t('dashboard.loading')} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            ⚙️ {t('dashboard.adminPanel')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.adminWelcome', { name: user?.name })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge 
            variant={systemHealth.status === 'healthy' ? 'success' : 'destructive'} 
            className="px-3 py-1"
          >
            {t('dashboard.systemStatus')}: {systemHealth.status}
          </Badge>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {t('dashboard.totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {numberHelpers.formatNumber(dashboardData.stats.totalUsers)}
            </div>
            <p className="text-xs text-green-600">
              +{dashboardData.stats.newUsersToday} {t('dashboard.today')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('dashboard.activeFarmers')}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {numberHelpers.formatNumber(dashboardData.stats.activeFarmers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.farmerGrowth}% {t('dashboard.growth')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              {t('dashboard.apiCalls')}
            </CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {numberHelpers.formatNumber(dashboardData.stats.apiCallsToday)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.last24Hours')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
              {t('dashboard.pendingIssues')}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {pendingActions.length}
            </div>
            <p className="text-xs text-red-600">
              {pendingActions.filter(a => a.priority === 'high').length} {t('dashboard.highPriority')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
          <TabsTrigger value="users">{t('dashboard.users')}</TabsTrigger>
          <TabsTrigger value="system">{t('dashboard.system')}</TabsTrigger>
          <TabsTrigger value="reports">{t('dashboard.reports')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t('dashboard.systemHealth')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('dashboard.serverUptime')}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={systemHealth.uptime || 99.5} className="w-20 h-2" />
                      <span className="text-sm font-medium">{systemHealth.uptime || 99.5}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('dashboard.databaseHealth')}</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{t('dashboard.healthy')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('dashboard.apiResponseTime')}</span>
                    <span className="text-sm font-medium">{systemHealth.responseTime || 120}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('dashboard.errorRate')}</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemHealth.errorRate || 0.01}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {t('dashboard.recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 hover:bg-accent/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'error' ? 'bg-red-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {dateHelpers.formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {t('dashboard.pendingActions')}
                </span>
                <Badge variant="outline">{pendingActions.length} {t('dashboard.items')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        action.priority === 'high' ? 'bg-red-500' :
                        action.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dateHelpers.formatRelativeTime(action.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          action.priority === 'high' ? 'destructive' :
                          action.priority === 'medium' ? 'warning' : 'secondary'
                        }
                      >
                        {action.priority}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {t('dashboard.resolve')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.userStats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {numberHelpers.formatNumber(dashboardData.userBreakdown.farmers)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.farmers')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {numberHelpers.formatNumber(dashboardData.userBreakdown.buyers)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.buyers')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {numberHelpers.formatNumber(dashboardData.userBreakdown.admins)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.admins')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('dashboard.userGrowth')}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* User growth chart would go here */}
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  📈 {t('dashboard.userGrowthChart')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.systemSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('dashboard.configureSystem')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  {t('dashboard.databaseMaintenance')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  {t('dashboard.securitySettings')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.systemLogs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
                  {systemHealth.logs?.map((log, index) => (
                    <div key={index} className={`p-2 rounded ${
                      log.level === 'error' ? 'bg-red-50 text-red-700' :
                      log.level === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      <span className="opacity-60">[{dateHelpers.formatDate(log.timestamp, 'HH:mm:ss')}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: t('dashboard.userReport'), icon: Users, desc: t('dashboard.userReportDesc') },
              { title: t('dashboard.usageReport'), icon: BarChart3, desc: t('dashboard.usageReportDesc') },
              { title: t('dashboard.performanceReport'), icon: Activity, desc: t('dashboard.performanceReportDesc') },
              { title: t('dashboard.securityReport'), icon: Shield, desc: t('dashboard.securityReportDesc') },
              { title: t('dashboard.feedbackReport'), icon: MessageSquare, desc: t('dashboard.feedbackReportDesc') },
              { title: t('dashboard.systemReport'), icon: Database, desc: t('dashboard.systemReportDesc') }
            ].map((report, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <report.icon className="h-5 w-5 text-primary" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
                  <Button size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    {t('dashboard.generateReport')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
