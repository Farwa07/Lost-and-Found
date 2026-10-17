import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

// React Router stores the position in its own history stack as `idx`.
export const hasInAppHistory = () => (window.history.state?.idx ?? 0) > 0;

// Goes back like the browser button (so the previous page keeps its filters
// and scroll position). When the page was opened directly from a link or a
// new tab there is nothing to go back to, so it navigates to `fallback`.
export default function useSmartBack(fallback = "/") {
  const navigate = useNavigate();

  return useCallback(() => {
    if (hasInAppHistory()) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
