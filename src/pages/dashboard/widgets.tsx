import WidgetCard from "@/components/widgetCard";
import { DashboardWidget } from "@/types/dashboard";

interface WidgetGridProps {
  widgets: DashboardWidget[];
  isOpen: boolean;
}

export default function WidgetGrid({
  widgets,
  isOpen,
}: Readonly<WidgetGridProps>) {
  return (
    <div
      className={`
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-6
        gap-6
        overflow-hidden
        transition-all
        duration-500
        ${
          isOpen
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 opacity-0"
        }
      `}
    >
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.title}
          {...widget}
        />
      ))}
    </div>
  );
}