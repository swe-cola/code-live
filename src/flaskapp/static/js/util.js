const network = {
  isOnline: false,
  showOffline: (elem) => {
    network.isOnline = false;
    elem.innerHTML = '<span class="red"> </span>';
  },
  showOnline: (elem) => {
    network.isOnline = true;
    elem.innerHTML = '<i class="fas fa-wifi"></i>';
  },
  statusListener: elem => {
    return (event) => {
      if (network.isOnline && (
        event.name == 'status-changed' && event.value == 'deactivated' ||
        event.name == 'stream-connection-status-changed' && event.value == 'disconnected' ||
        event.name == 'document-sync-result' && event.value == 'sync-failed'
      )) {
        network.showOffline(elem);
      } else if (!network.isOnline && (
        event.name == 'status-changed' && event.value == 'activated' ||
        event.name == 'stream-connection-status-changed' && event.value == 'connected' ||
        event.name == 'document-sync-result' && event.value == 'synced' ||
        event.name == 'documents-watching-peer-changed' ||
        event.name == 'documents-changed'
      )) {
        network.showOnline(elem);
      }
    }
  },
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts.pop().split(';').shift();
}
