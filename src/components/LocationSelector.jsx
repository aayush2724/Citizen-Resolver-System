import { locations } from "../data/mockData";

export default function LocationSelector({
  selectedCity,
  selectedBlock,
  selectedArea,
  onCityChange,
  onBlockChange,
  onAreaChange,
}) {
  const selectedCityData = locations.find((loc) => loc.city === selectedCity);
  const selectedBlockData = selectedCityData?.blocks.find(
    (block) => block.name === selectedBlock,
  );
  const blockOptions =
    selectedCityData?.blocks.map((block) => block.name) ?? [];
  const areaOptions = selectedBlockData?.areas ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="grid gap-2">
        <span className="text-sm font-black text-slate-700">City</span>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          required
        >
          <option value="">Select city</option>
          {locations.map((loc) => (
            <option key={loc.city} value={loc.city}>
              {loc.city}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-slate-700">Block</span>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
          value={selectedBlock}
          onChange={(e) => onBlockChange(e.target.value)}
          disabled={!selectedCity}
          required
        >
          <option value="">Select block</option>
          {blockOptions.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-slate-700">Area</span>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          disabled={!selectedBlock}
          required
        >
          <option value="">Select area</option>
          {areaOptions.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
