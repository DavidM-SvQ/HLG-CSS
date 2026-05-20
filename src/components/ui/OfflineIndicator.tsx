import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, AlertCircle } from "lucide-react";
import { useNetworkState } from "../../lib/hooks/useNetworkState";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useAuth } from "../../lib/auth/AuthContext";

export function OfflineIndicator() {
  const isOnline = useNetworkState();
  const { isSupabaseConfigured } = useAuth();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 bg-red-600/90 backdrop-blur-sm text-white rounded-xl shadow-lg border border-red-500 flex items-center gap-3 w-fit max-w-[90vw]"
        >
          <WifiOff className="w-5 h-5 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide">Estás sin conexión</span>
            <span className="text-xs text-red-100">
              La app está funcionando en modo "Local First". Los cambios no se sincronizarán hasta que recuperes la red.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
