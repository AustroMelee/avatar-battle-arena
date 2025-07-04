import { useState, useCallback, useRef } from 'react';

interface NarrativeLineTracker {
  recentLines: string[];
  maxRecent: number;
  usageCount: Record<string, number>;
}

/**
 * @description React hook for managing narrative line selection with anti-repetition logic
 * @param pool - Array of narrative options
 * @param maxRecent - Maximum number of recent lines to avoid (default: 3)
 * @returns Object with pickFreshLine function and usage statistics
 */
export function useNarrativeLine(pool: string[], maxRecent: number = 3) {
  const trackerRef = useRef<NarrativeLineTracker>({
    recentLines: [],
    maxRecent,
    usageCount: {}
  });

  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  const pickFreshLine = useCallback((): string => {
    const tracker = trackerRef.current;
    
    // Filter out recently used lines
    const freshLines = pool.filter(line => !tracker.recentLines.includes(line));
    
    // If all lines have been used recently, reset the buffer
    if (freshLines.length === 0) {
      tracker.recentLines = [];
      const selected = pool[Math.floor(Math.random() * pool.length)];
      tracker.recentLines.push(selected);
      return selected;
    }
    
    // Select from fresh lines
    const selected = freshLines[Math.floor(Math.random() * freshLines.length)];
    
    // Add to recent usage
    tracker.recentLines.push(selected);
    if (tracker.recentLines.length > tracker.maxRecent) {
      tracker.recentLines.shift();
    }
    
    // Update usage count
    tracker.usageCount[selected] = (tracker.usageCount[selected] || 0) + 1;
    setUsageStats({ ...tracker.usageCount });
    
    return selected;
  }, [pool, maxRecent]);

  const reset = useCallback(() => {
    trackerRef.current = {
      recentLines: [],
      maxRecent,
      usageCount: {}
    };
    setUsageStats({});
  }, [maxRecent]);

  const getUsageStats = useCallback(() => {
    return {
      recentLines: [...trackerRef.current.recentLines],
      usageCount: { ...trackerRef.current.usageCount },
      totalLines: pool.length,
      freshLinesAvailable: pool.filter(line => !trackerRef.current.recentLines.includes(line)).length
    };
  }, [pool]);

  return {
    pickFreshLine,
    reset,
    getUsageStats,
    usageStats
  };
}

/**
 * @description Hook for managing multiple narrative pools (e.g., per character, per state)
 * @param pools - Object with pool names as keys and narrative arrays as values
 * @param maxRecent - Maximum number of recent lines to avoid per pool
 * @returns Object with pickFreshLine function for each pool
 */
export function useMultipleNarrativePools(
  pools: Record<string, string[]>,
  maxRecent: number = 3
) {
  const trackersRef = useRef<Record<string, NarrativeLineTracker>>({});
  const [usageStats, setUsageStats] = useState<Record<string, Record<string, number>>>({});

  const pickFreshLine = useCallback((poolName: string): string => {
    const pool = pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    // Initialize tracker for this pool
    if (!trackersRef.current[poolName]) {
      trackersRef.current[poolName] = {
        recentLines: [],
        maxRecent,
        usageCount: {}
      };
    }

    const tracker = trackersRef.current[poolName];
    
    // Filter out recently used lines
    const freshLines = pool.filter(line => !tracker.recentLines.includes(line));
    
    // If all lines have been used recently, reset the buffer
    if (freshLines.length === 0) {
      tracker.recentLines = [];
      const selected = pool[Math.floor(Math.random() * pool.length)];
      tracker.recentLines.push(selected);
      return selected;
    }
    
    // Select from fresh lines
    const selected = freshLines[Math.floor(Math.random() * freshLines.length)];
    
    // Add to recent usage
    tracker.recentLines.push(selected);
    if (tracker.recentLines.length > tracker.maxRecent) {
      tracker.recentLines.shift();
    }
    
    // Update usage count
    tracker.usageCount[selected] = (tracker.usageCount[selected] || 0) + 1;
    setUsageStats(prev => ({
      ...prev,
      [poolName]: { ...tracker.usageCount }
    }));
    
    return selected;
  }, [pools, maxRecent]);

  const reset = useCallback((poolName?: string) => {
    if (poolName) {
      // Reset specific pool
      trackersRef.current[poolName] = {
        recentLines: [],
        maxRecent,
        usageCount: {}
      };
      setUsageStats(prev => ({
        ...prev,
        [poolName]: {}
      }));
    } else {
      // Reset all pools
      trackersRef.current = {};
      setUsageStats({});
    }
  }, [maxRecent]);

  const getUsageStats = useCallback((poolName?: string) => {
    if (poolName) {
      const tracker = trackersRef.current[poolName];
      const pool = pools[poolName];
      if (!tracker || !pool) return null;
      
      return {
        recentLines: [...tracker.recentLines],
        usageCount: { ...tracker.usageCount },
        totalLines: pool.length,
        freshLinesAvailable: pool.filter(line => !tracker.recentLines.includes(line)).length
      };
    }
    
    // Return stats for all pools
    return Object.keys(pools).reduce((acc, poolName) => {
      const tracker = trackersRef.current[poolName];
      const pool = pools[poolName];
      if (tracker && pool) {
        acc[poolName] = {
          recentLines: [...tracker.recentLines],
          usageCount: { ...tracker.usageCount },
          totalLines: pool.length,
          freshLinesAvailable: pool.filter(line => !tracker.recentLines.includes(line)).length
        };
      }
      return acc;
    }, {} as Record<string, any>);
  }, [pools]);

  return {
    pickFreshLine,
    reset,
    getUsageStats,
    usageStats
  };
} 