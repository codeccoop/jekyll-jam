import { useLocation } from "react-router-dom";

export function useQueryParams() {
  const location = useLocation();

  return Object.fromEntries(new URLSearchParams(location.search).entries());
}
