export function formatGradeDisplay(
  value: number | string | undefined,
): string {
  if (value === undefined || value === "" || value === "-") {
    return "—";
  }
  if (typeof value === "number") {
    return value.toFixed(1);
  }
  return String(value);
}

export function ExportGradeValue({
  value,
}: {
  value: number | string | undefined;
}) {
  return (
    <span className="inline-flex min-w-[4.5rem] items-center justify-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900">
      {formatGradeDisplay(value)}
    </span>
  );
}

export function ExportCompletionValue({ completed }: { completed: boolean }) {
  return (
    <span
      className={`text-sm font-medium ${
        completed ? "text-green-700" : "text-gray-500"
      }`}
    >
      {completed ? "Completed" : "Not completed"}
    </span>
  );
}

export function ExportSelectionValue({
  value,
  placeholder = "Not selected",
}: {
  value: string | undefined;
  placeholder?: string;
}) {
  return (
    <span className="text-sm font-medium text-gray-900">
      {value?.trim() ? value : placeholder}
    </span>
  );
}
