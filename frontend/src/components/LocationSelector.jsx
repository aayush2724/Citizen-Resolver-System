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
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">City</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#151515] text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none disabled:bg-white/5 disabled:text-slate-500"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          required
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem',
          }}
        >
          <option value="" className="bg-[#151515]">Select city</option>
          {locations.map((loc) => (
            <option key={loc.city} value={loc.city} className="bg-[#151515]">
              {loc.city}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Block</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#151515] text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none disabled:bg-white/5 disabled:text-slate-500"
          value={selectedBlock}
          onChange={(e) => onBlockChange(e.target.value)}
          disabled={!selectedCity}
          required
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem',
          }}
        >
          <option value="" className="bg-[#151515]">Select block</option>
          {blockOptions.map((block) => (
            <option key={block} value={block} className="bg-[#151515]">
              {block}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Area</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#151515] text-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none disabled:bg-white/5 disabled:text-slate-500"
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          disabled={!selectedBlock}
          required
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem',
          }}
        >
          <option value="" className="bg-[#151515]">Select area</option>
          {areaOptions.map((area) => (
            <option key={area} value={area} className="bg-[#151515]">
              {area}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
