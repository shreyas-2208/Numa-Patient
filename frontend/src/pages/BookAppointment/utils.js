export function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dateForComparison = d.toISOString().slice(0, 10);
  const todayForComparison = today.toISOString().slice(0, 10);
  const tomorrowForComparison = tomorrow.toISOString().slice(0, 10);

  if (dateForComparison === todayForComparison) return "Today";
  if (dateForComparison === tomorrowForComparison) return "Tomorrow";

  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString(undefined, { month: "short" }),
  };
}
