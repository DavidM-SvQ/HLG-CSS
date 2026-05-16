import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { ChevronDown } from "lucide-react";

export function MultiSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string[], onChange: (v: string[]) => void, placeholder: string }) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="h-9 justify-start text-left font-normal px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 flex items-center min-w-[150px] shadow-sm hover:bg-neutral-50 w-full">
          <span className="truncate flex-1">{value.length === 0 ? placeholder : `${placeholder} (${value.length})`}</span>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>} />
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2 flex flex-col gap-1 max-h-60 overflow-y-auto w-full">
             <label className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded cursor-pointer">
               <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} className="rounded text-blue-600 focus:ring-blue-500" />
               <span className="text-sm font-medium">Todos</span>
             </label>
             <div className="h-px bg-neutral-100 my-1"></div>
             {options.map(opt => (
               <label key={opt.value} className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded cursor-pointer">
                 <input type="checkbox" checked={value.includes(opt.value)} onChange={(e) => {
                   if (e.target.checked) onChange([...value, opt.value]);
                   else onChange(value.filter(v => v !== opt.value));
                 }} className="rounded text-blue-600 focus:ring-blue-500" />
                 <span className="text-sm truncate">{opt.label}</span>
               </label>
             ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
