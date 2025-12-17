import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Trash2,
  CheckCheck,
  Bell,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/NotificationProvider";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "share":
        return <Share2 className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter(n => !n.read)
      : notifications;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.read
                    ? "bg-card border-border hover:bg-secondary/30"
                    : "bg-primary/5 border-primary/30 hover:bg-primary/10"
                }`}
              >
                {/* Icon */}
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/profile/${notification.actor.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
                        <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                        to={`/profile/${notification.actor.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {notification.actor.name}
                      </Link>
                      <span className="text-muted-foreground ml-1">{notification.message}</span>
                    </div>
                  </div>

                  {notification.targetBlog && notification.targetBlog.title && (
                    <Link
                      to={`/blog/${notification.targetBlog.id}`}
                      className="text-sm text-primary hover:underline block truncate"
                    >
                      "{notification.targetBlog.title}"
                    </Link>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>

                {/* Unread Badge & Delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.read && (
                    <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No notifications</p>
            <p className="text-muted-foreground">
              {filter === "unread"
                ? "You're all caught up!"
                : "You don't have any notifications yet."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
