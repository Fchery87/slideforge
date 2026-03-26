import type { ColorFilter, FilterType } from "@/domain/slideshow/value-objects/slide-effects";

interface FilterContainerProps {
  filter: ColorFilter;
  children: React.ReactNode;
}

function getFilterString(type: FilterType, intensity: number): string {
  const ratio = intensity / 100;

  switch (type) {
    case "grayscale":
    case "black-white":
      return `grayscale(${ratio * 100}%)`;
    case "sepia":
      return `sepia(${ratio * 100}%)`;
    case "vintage":
      return `sepia(${ratio * 60}%) contrast(${1 + ratio * 0.1})`;
    case "cinematic":
      return `contrast(${1 + ratio * 0.2}) saturate(${1 + ratio * 0.1})`;
    case "warm":
      return `sepia(${ratio * 30}%) saturate(${1 + ratio * 0.3})`;
    case "cool":
      return `hue-rotate(${ratio * -15}deg) saturate(${1 - ratio * 0.1})`;
    case "vivid":
      return `saturate(${1 + ratio * 0.5}) contrast(${1 + ratio * 0.2})`;
    case "dramatic":
      return `contrast(${1 + ratio * 0.4}) brightness(${1 - ratio * 0.15}) saturate(${1 - ratio * 0.1})`;
    case "none":
    default:
      return "";
  }
}

export function FilterContainer({ filter, children }: FilterContainerProps) {
  if (!filter?.enabled || filter.type === "none") {
    return <>{children}</>;
  }

  const filters: string[] = [];

  // Apply color filter
  const colorFilter = getFilterString(filter.type, filter.intensity);
  if (colorFilter) {
    filters.push(colorFilter);
  }

  // Apply brightness
  if (filter.brightness !== 0) {
    filters.push(`brightness(${1 + filter.brightness / 100})`);
  }

  // Apply contrast
  if (filter.contrast !== 0) {
    filters.push(`contrast(${1 + filter.contrast / 100})`);
  }

  // Apply saturation
  if (filter.saturation !== 0) {
    filters.push(`saturate(${1 + filter.saturation / 100})`);
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        filter: filters.join(" "),
      }}
    >
      {children}
    </div>
  );
}
