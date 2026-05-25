import React from 'react';
import { useUrlState } from '../../../hooks/useUrlState';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { GhostDraftView } from '../tests/GhostDraftView';

export const DraftFantasmaView = ({ files, cyclistMetadata, playerTeamMap, playerOrderMap }: any) => {
  const [subTab, setSubTab] = useUrlState<'puntos' | 'rondas'>('draftFantasmaSubtab', 'puntos');

  return (
    <div className="space-y-6 mt-6">
      <div className="flex bg-neutral-100 p-1 rounded-lg self-start w-fit mb-6">
        <Button variant="outline"
          onClick={() => setSubTab('puntos')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            subTab === 'puntos'
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Por puntos
        </Button>
        <Button variant="outline"
          onClick={() => setSubTab('rondas')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            subTab === 'rondas'
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Por rondas
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'puntos' && (
          <motion.div
            key="puntos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GhostDraftView 
              files={files} 
              cyclistMetadata={cyclistMetadata} 
              playerTeamMap={playerTeamMap} 
              playerOrderMap={playerOrderMap} 
              mode="puntos"
            />
          </motion.div>
        )}
        {subTab === 'rondas' && (
            <motion.div
            key="rondas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GhostDraftView 
              files={files} 
              cyclistMetadata={cyclistMetadata} 
              playerTeamMap={playerTeamMap} 
              playerOrderMap={playerOrderMap} 
              mode="rondas"
            />
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};