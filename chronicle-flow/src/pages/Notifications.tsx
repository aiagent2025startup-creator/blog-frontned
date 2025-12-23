import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  MessageCircle,
  Heart,
  UserPlus,
  ArrowLeft,
  CheckCheck
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications } from "@/context/NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500 fill-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold font-display">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-muted-foreground hover:text-primary"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
              <p className="text-muted-foreground max-w-xs">
                When you get likes, comments, or new followers, they'll show up here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 flex items-start gap-4 transition-colors hover:bg-secondary/30",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="mt-1">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={notification.actor.avatar} />
                        <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                        {getIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">
                            {notification.actor.name}
                          </span>
                          {" "}
                          <span className="text-muted-foreground">
                            {notification.type === 'like' && 'liked your blog'}
                            {notification.type === 'comment' && 'commented on'}
                            {notification.type === 'follow' && 'started following you'}
                          </span>
                          {" "}
                          {notification.targetBlog && (
                            <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate(`/blog/${notification.targetBlog?.id}`)}>
                              "{notification.targetBlog.title}"
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>

                      {notification.message && notification.type === 'comment' && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 bg-secondary/50 p-2 rounded-md border border-border/50">
                          "{notification.message}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
