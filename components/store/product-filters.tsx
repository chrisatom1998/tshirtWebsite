import { ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ProductFilters({
  sizes,
  colors,
  currentSearch,
  currentSize,
  currentColor,
  currentFeatured,
}: {
  sizes: string[];
  colors: string[];
  currentSearch?: string;
  currentSize?: string;
  currentColor?: string;
  currentFeatured?: string;
}) {
  return (
    <form className="glass-panel grid gap-4 p-6 lg:grid-cols-[2fr,1fr,1fr,auto,auto]" action="/products">
      <Input name="search" placeholder="Search shirt names or descriptions" defaultValue={currentSearch} />
      <Select name="size" defaultValue={currentSize || ""}>
        <option value="">All sizes</option>
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Select>
      <Select name="color" defaultValue={currentColor || ""}>
        <option value="">All colors</option>
        {colors.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </Select>
      <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black/70">
        <input type="checkbox" name="featured" value="true" defaultChecked={currentFeatured === "true"} />
        Featured only
      </label>
      <div className="flex gap-3">
        <button className="ring-focus rounded-full bg-ink px-5 text-sm font-semibold text-white">Apply</button>
        <ButtonLink href="/products" variant="ghost">
          Reset
        </ButtonLink>
      </div>
    </form>
  );
}
