import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
  BellOff,
} from "lucide-react";
import type { Alert } from "@shared/schema";

export default function AlertsPage() {
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return AlertTriangle;
      case "warning":
        return AlertCircle;
      case "info":
        return Info;
      default:
        return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900";
      case "info":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900";
      default:
        return "bg-muted";
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "secondary";
    }
  };

  const criticalAlerts = alerts?.filter((a) => a.severity === "critical");
  const warningAlerts = alerts?.filter((a) => a.severity === "warning");
  const infoAlerts = alerts?.filter((a) => a.severity === "info");

  return (
    <div className="space-y-6" data-testid="page-alerts">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor system alerts and delivery status changes
          </p>
        </div>
        <Button variant="outline" data-testid="button-mark-all-read">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Critical
                </p>
                <h3 className="text-3xl font-bold mt-2 text-red-600">
                  {criticalAlerts?.length ?? 0}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100 dark:bg-red-950/20">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Warnings
                </p>
                <h3 className="text-3xl font-bold mt-2 text-yellow-600">
                  {warningAlerts?.length ?? 0}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-950/20">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Info
                </p>
                <h3 className="text-3xl font-bold mt-2 text-blue-600">
                  {infoAlerts?.length ?? 0}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950/20">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Alert Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-alerts">
                All ({alerts?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="critical" data-testid="tab-critical-alerts">
                Critical ({criticalAlerts?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="warning" data-testid="tab-warning-alerts">
                Warnings ({warningAlerts?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="info" data-testid="tab-info-alerts">
                Info ({infoAlerts?.length ?? 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts && alerts.length > 0 ? (
                    alerts.map((alert) => {
                      const Icon = getSeverityIcon(alert.severity);
                      return (
                        <div
                          key={alert.id}
                          className={`flex items-start gap-4 rounded-md border p-4 ${getSeverityBg(
                            alert.severity
                          )} ${!alert.isRead ? "font-medium" : ""}`}
                          data-testid={`alert-item-${alert.id}`}
                        >
                          <Icon className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm">{alert.message}</p>
                              {!alert.isRead && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                                {alert.severity}
                              </Badge>
                              <span className="font-mono">
                                {new Date(alert.createdAt).toLocaleString()}
                              </span>
                              {alert.vehicleId && (
                                <span className="font-mono">Vehicle: {alert.vehicleId.slice(0, 8)}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-dismiss-${alert.id}`}
                          >
                            <BellOff className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No alerts to display</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="critical" className="mt-6">
              <div className="space-y-3">
                {criticalAlerts && criticalAlerts.length > 0 ? (
                  criticalAlerts.map((alert) => {
                    const Icon = getSeverityIcon(alert.severity);
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-4 rounded-md border p-4 ${getSeverityBg(
                          alert.severity
                        )}`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p>No critical alerts</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="warning" className="mt-6">
              <div className="space-y-3">
                {warningAlerts && warningAlerts.length > 0 ? (
                  warningAlerts.map((alert) => {
                    const Icon = getSeverityIcon(alert.severity);
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-4 rounded-md border p-4 ${getSeverityBg(
                          alert.severity
                        )}`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1 space-y-2">
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p>No warning alerts</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-6">
              <div className="space-y-3">
                {infoAlerts && infoAlerts.length > 0 ? (
                  infoAlerts.map((alert) => {
                    const Icon = getSeverityIcon(alert.severity);
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-4 rounded-md border p-4 ${getSeverityBg(
                          alert.severity
                        )}`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1 space-y-2">
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No info alerts</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
