import React from "react";
import { Globe, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { AppState } from "../../../../lib/types";

export const AdminDatosFileList = ({ files, FILE_TYPES, handleFileUpload, user }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Gestión de Datos</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Sube y sincroniza los archivos maestros del juego.
        </p>
      </div>

      {!user && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            <Globe className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Modo Local</p>
              <p className="text-xs text-blue-700 mt-1">
                Inicia sesión para cargar y sincronizar los archivos globales automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {FILE_TYPES.filter((ft: any) => !ft.hiddenInAdmin).map((ft: any) => {
          const state = files[ft.id as keyof AppState];
          const Icon = ft.icon;

          return (
            <div
              key={ft.id}
              className={cn(
                "relative overflow-hidden border rounded-xl p-4 transition-all",
                state.data
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-neutral-200 hover:border-blue-300",
                state.loading && "animate-pulse opacity-70",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      state.data
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-600",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-sm text-neutral-900">
                        {ft.name}
                      </h3>
                      {ft.global && (
                        <span title="Archivo Global">
                          <Globe className="w-3 h-3 text-neutral-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {state.loading
                        ? "Sincronizando..."
                        : state.data
                          ? ft.global
                            ? "Sincronizado en la nube"
                            : state.file?.name
                          : "Esperando archivo..."}
                    </p>
                    {state.updatedAt && (
                      <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(state.updatedAt).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {state.data ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  ) : state.error ? (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  ) : null}
                </div>
              </div>

              {state.error && (
                <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                  {state.error}
                </div>
              )}

              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(ft.id as keyof AppState, file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title={`Subir ${ft.name}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
