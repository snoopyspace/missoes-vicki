// Service Worker para Push Notifications

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Missões da Vicki";
  const options = {
    body: data.body || "Você tem novas tarefas para completar!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "missoes-vicki",
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Abrir App",
      },
      {
        action: "close",
        title: "Fechar",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});

// Handle periodic background sync for reminders
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-reminder") {
    event.waitUntil(
      self.registration.showNotification("Lembrete: Missões da Vicki", {
        body: "Não esqueça de completar suas tarefas de hoje!",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "daily-reminder",
      })
    );
  }
});
