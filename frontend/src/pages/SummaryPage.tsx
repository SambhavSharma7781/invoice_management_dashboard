import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopCustomers } from "@/api/summary";
import { GlobalMetricCards } from "@/components/summary/GlobalMetricCards";
import { TopCustomersChart } from "@/components/summary/TopCustomersChart";
import { Button } from "@/components/ui/Button";
import type { TopCustomerSummary } from "@/types/api";
import { getApiErrorMessage } from "@/utils/customer";

export default function SummaryPage() {
  const [topCustomers, setTopCustomers] = useState<TopCustomerSummary[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [countsLoaded, setCountsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTopCustomers = async () => {
      setChartLoading(true);
      setChartError(null);

      try {
        const response = await getTopCustomers();

        if (!cancelled) {
          setTopCustomers(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setChartError(getApiErrorMessage(err));
          setTopCustomers([]);
        }
      } finally {
        if (!cancelled) {
          setChartLoading(false);
        }
      }
    };

    void loadTopCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  if (countsError && !countsLoaded) {
    return (
      <div className="container mx-auto min-w-0 max-w-7xl p-4 md:p-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Summary / Analytics
          </h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </header>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600">
          {countsError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-w-0 max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Summary / Analytics
        </h1>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <GlobalMetricCards
        className="mb-8"
        showErrorBanner
        onCountsError={(error) => {
          setCountsError(error);
          if (!error) {
            setCountsLoaded(true);
          }
        }}
      />

      <section>
        <TopCustomersChart
          customers={topCustomers}
          loading={chartLoading}
          error={chartError}
        />
      </section>
    </div>
  );
}
