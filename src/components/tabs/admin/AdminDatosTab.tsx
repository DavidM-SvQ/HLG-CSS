import React from "react";
import { AppState } from "../../../lib/types";
import { AdminDatosFileList } from "./admin_datos/AdminDatosFileList";
import { AdminDatosLeaderboardChart } from "./admin_datos/AdminDatosLeaderboardChart";

interface AdminDatosTabProps {
  files: any; // We'll type this better if possible
  user: any;
  FILE_TYPES: any[];
  handleFileUpload: (id: keyof AppState, file: File) => void;
  leaderboard: any[] | null;
}

export const AdminDatosTab: React.FC<AdminDatosTabProps> = ({
  files,
  user,
  FILE_TYPES,
  handleFileUpload,
  leaderboard
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: File Uploads (Only for Admin) */}
      <div className="lg:col-span-4 space-y-6">
        <AdminDatosFileList files={files} user={user} FILE_TYPES={FILE_TYPES} handleFileUpload={handleFileUpload} />
      </div>

      {/* Main Content: Leaderboard */}
      <div className="lg:col-span-8">
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-semibold text-neutral-900 whitespace-nowrap">
              Clasificación General
            </h2>
            <p className="text-sm text-neutral-500 whitespace-nowrap">
              Resultados actualizados según los archivos cargados.
            </p>
          </div>

          <div className="p-6">
            <AdminDatosLeaderboardChart leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  );
};
