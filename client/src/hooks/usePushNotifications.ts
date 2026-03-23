import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const subscriptionMutation = trpc.notifications.subscribe.useMutation();
  const { data: settings } = trpc.notifications.getSettings.useQuery();

  useEffect(() => {
    // Check if browser supports service workers and push notifications
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (!supported) return;

    // Register service worker
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      setRegistration(reg);

      // Check if already subscribed
      reg.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
      });
    }).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }, []);

  const subscribe = async () => {
    if (!registration || !isSupported) return;

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Save subscription to database
      await subscriptionMutation.mutateAsync({
        endpoint: subscription.endpoint,
        isEnabled: true,
      });

      setIsSubscribed(true);
      console.log("Subscribed to push notifications");
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  };

  const unsubscribe = async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Update database
        await subscriptionMutation.mutateAsync({
          endpoint: subscription.endpoint,
          isEnabled: false,
        });

        setIsSubscribed(false);
        console.log("Unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    settings,
  };
}
