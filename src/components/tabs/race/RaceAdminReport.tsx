import React from "react";
import { ClipboardList } from "lucide-react";

interface AdminReportProps {
  isAdminReport: boolean;
  rankedTeams: any[];
  raceCyclists: any[];
  textValue: string;
}

export const RaceAdminReport: React.FC<AdminReportProps> = ({
  isAdminReport,
  rankedTeams,
  raceCyclists,
  textValue,
}) => {
  if (!isAdminReport || !rankedTeams || !raceCyclists) return null;

  return (
    <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 mt-8 mb-12">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-blue-500" />
        Reporte Telegram
      </h3>
      <textarea
        readOnly
        value={textValue}
        className="w-full h-48 text-sm font-mono p-4 border rounded-lg mb-4 bg-white"
      />
      <div className="flex gap-4">
        <button
          onClick={(e) => {
            const textarea = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement);
            if (textarea) {
              navigator.clipboard.writeText(textarea.value);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition-colors"
        >
          <ClipboardList className="w-4 h-4" /> Copiar para Telegram
        </button>
      </div>
    </div>
  );
};
