import { useEffect, useState } from "react";
import { AlertTriangle, CloudOff, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  backendUnavailableCopy,
  CONNECTION_CHECK_BUSY_LABEL,
  CONNECTION_CHECK_LABEL,
  isBackendUnavailable,
} from "@/lib/backendStatus";

export function BackendConnectivityMonitor() {
  const queryClient = useQueryClient();
  const offline = useBrowserOffline();
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      if (event.type === "updated" && event.action.type === "error" && isBackendUnavailable(event.query.state.error)) setBackendError(true);
      if (event.type === "updated" && event.action.type === "success") setBackendError(false);
    });
    return unsubscribe;
  }, [queryClient]);

  if (!offline && !backendError) return null;
  return <BackendConnectivityBanner offline={offline} />;
}

export function BackendConnectivityBanner({ offline = false }: { offline?: boolean }) {
  const queryClient = useQueryClient();
  const copy = backendUnavailableCopy(offline);
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    setRetrying(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="backend-connectivity-banner" role="alert" aria-live="polite">
      <div className="backend-connectivity-icon" aria-hidden="true">
        {offline ? <CloudOff size={18} /> : <AlertTriangle size={18} />}
      </div>
      <div className="backend-connectivity-copy">
        <div className="eyebrow">{copy.eyebrow}</div>
        <strong>{copy.title}</strong>
        <span>{copy.body}</span>
      </div>
      <button
        type="button"
        className="backend-connectivity-retry"
        onClick={() => void retry()}
        disabled={retrying}
        aria-label="Check backend connection"
        title="Check backend connection"
      >
        <RefreshCw size={14} className={retrying ? "spin" : undefined} />
        {retrying ? CONNECTION_CHECK_BUSY_LABEL : CONNECTION_CHECK_LABEL}
      </button>
    </div>
  );
}

export function BackendUnavailablePanel({ offline, onRetry }: { offline: boolean; onRetry: () => void }) {
  const copy = backendUnavailableCopy(offline);
  return (
    <section className="module-panel backend-unavailable-panel" role="alert">
      <div className="backend-unavailable-icon" aria-hidden="true">{offline ? <CloudOff size={24} /> : <AlertTriangle size={24} />}</div>
      <div>
        <div className="eyebrow red-label">{copy.eyebrow}</div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <button type="button" className="primary-btn" onClick={onRetry}>{CONNECTION_CHECK_LABEL}</button>
      </div>
    </section>
  );
}

export function useBrowserOffline() {
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && navigator.onLine === false);
  useEffect(() => {
    const online = () => setOffline(false);
    const offlineEvent = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineEvent);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineEvent);
    };
  }, []);
  return offline;
}
