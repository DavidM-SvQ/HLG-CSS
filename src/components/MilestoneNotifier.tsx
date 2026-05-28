import React, { useEffect, useRef } from "react";
import { useDataStore } from "../lib/stores/useDataStore";
import { useComputedStore } from "../lib/stores/useComputedStore";
import { useSeasonMilestonesLogic } from "./tabs/season/hooks/useSeasonMilestonesLogic";
import { toast } from "sonner";

export function MilestoneNotifier() {
  const { files } = useDataStore();
  const leaderboard = useComputedStore((s) => s.leaderboard);
  const cyclistMetadata = useComputedStore((s) => s.cyclistMetadata);
  const raceWinners = useComputedStore((s) => s.raceWinners);
  
  const { teamMilestones, cyclistMilestones } = useSeasonMilestonesLogic({
    leaderboard: leaderboard || [],
    files,
    cyclistMetadata: cyclistMetadata || {},
    raceWinners: raceWinners || {}
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!leaderboard || leaderboard.length === 0) return;

    const allMilestones = [...teamMilestones, ...cyclistMilestones].sort((a, b) => a.order - b.order);
    if (allMilestones.length === 0) return;

    try {
      const stored = localStorage.getItem("seen_milestone_ids");
      const lastConnectionStr = localStorage.getItem("last_connection_time");
      
      const seenIds = stored ? new Set(JSON.parse(stored)) : null;
      const prevConnectionTime = lastConnectionStr ? parseInt(lastConnectionStr, 10) : 0;
      
      if (!initializedRef.current) {
        // Record current connection time once per session mount
        localStorage.setItem("last_connection_time", Date.now().toString());
        initializedRef.current = true;
      }

      // If no seenIds, it's the very first time. We just silently store them all so we don't spam notifications.
      if (!seenIds) {
        const newSeenIds = [...allMilestones.map(m => `${m.label}-${m.team || m.cyclist}`)];
        localStorage.setItem("seen_milestone_ids", JSON.stringify(newSeenIds));
        return;
      }

      const newMilestones = allMilestones.filter(m => {
        const id = `${m.label}-${m.team || m.cyclist}`;
        return !seenIds.has(id);
      });

      if (newMilestones.length > 0) {
        const newSeenIds = new Set(seenIds);
        
        // Find milestones whose order (race date) is technically after the previous connection time.
        // Even if we use seenIds to ensure we only show it once, we should respect the prompt's condition
        // of when it was produced. But actually, "when it was produced" might be when data was uploaded,
        // so showing it to the user since they haven't seen it is the most robust way.
        
        // Show up to 5 notifications to prevent browser freeze/spam if many unlocked at once
        const toShow = newMilestones.slice(0, 5);
        toShow.forEach((m, idx) => {
          setTimeout(() => {
            toast.success(`NUEVO HITO: ${m.date}`, {
              description: `${m.label} (${m.team || m.cyclist})`,
              duration: 8000,
            });
          }, idx * 1500 + 1000); // Stagger toasts slightly
        });
        
        if (newMilestones.length > 5) {
          setTimeout(() => {
            toast.info(`Y otros ${newMilestones.length - 5} hitos más...`, {
              description: `Abre la pestaña "Hitos de la temporada" para verlos todos.`,
              duration: 8000,
            });
          }, 5 * 1500 + 1000);
        }

        // Store them
        newMilestones.forEach(m => newSeenIds.add(`${m.label}-${m.team || m.cyclist}`));
        localStorage.setItem("seen_milestone_ids", JSON.stringify([...newSeenIds]));
      }

    } catch (err) {
      console.error("Error in MilestoneNotifier", err);
    }

  }, [teamMilestones, cyclistMilestones, leaderboard]);

  return null;
}
