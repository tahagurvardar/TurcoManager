import { useCallback, useEffect, useState } from "react";
import api from "../api";
import { LEAGUE } from "../utils/format";

export default function useDashboardData(user) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = user.role === "admin" ? "/dashboard/admin" : "/dashboard/manager";
      const response = await api.get(endpoint, { params: { league: LEAGUE } });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
    setData,
  };
}
