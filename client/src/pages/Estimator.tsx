import { useState } from "react";
import VehicleForm from "../components/estimator/VehicleForm";
import TripForm from "../components/estimator/TripForm";
import ResultPanel from "../components/estimator/ResultPanel";
import { useEstimatorForm } from "../hooks/useEstimatorForm";
import { emptyTripForm } from "../types/estimator";
import { saveLoad } from "../lib/loadsStore";

export default function Estimator() {
  const { form, result } = useEstimatorForm();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    reset,
    formState: { isValid },
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    setError(null);
    try {
      await saveLoad(data, result);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save load");
    } finally {
      setSaving(false);
    }
  });

  const handleReset = () => {
    reset(emptyTripForm);
    setSaved(false);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-5">
      <h1 className="mb-1 text-lg font-semibold sm:text-xl">External load cost estimator</h1>
      <p className="mb-5 text-sm text-gray-500 sm:mb-6">
        Fill the load details — cost breakdown updates live. Save to confirm the load.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <VehicleForm form={form} />
            <TripForm form={form} />
          </div>

          <ResultPanel
            result={result}
            canSave={isValid && !saving}
            saving={saving}
            saved={saved}
            onReset={handleReset}
          />
        </div>
      </form>
    </div>
  );
}
