// Used via dynamic registry or as a React hook. See SYSTEM ARCHITECTURE.MD for flow.
import { useState, useCallback, useRef } from 'react';

// Utility to check dev environment in browser or Node
function isDevEnv() {
  return typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
}

export type PoolName = string;
export type PoolConfig = { [poolName: string]: number } | number;

export interface UseNarrativeLineOptions {
  maxRecent?: number;
  fallbackLine?: string;
  onExhaustion?: () => void;
}

export interface NarrativeLineTracker {
  recentLines: string[];
  maxRecent: number;
  usageCount: Record<string, number>;
  lastUsed?: string | null; // Track last-used line for anti-repetition after buffer reset
}

/**
 * @description React hook for managing narrative line selection with anti-repetition logic
 * @param pool - Array of narrative options
 * @param maxRecent - Maximum number of recent lines to avoid (default: 3)
 * @returns Object with pickFreshLine function and usage statistics
 */
export function useNarrativeLine(
  pool: string[],
  options: UseNarrativeLineOptions = {}
) {
  const {
    maxRecent = 3,
    fallbackLine = '<No lines available>',
    onExhaustion,
  } = options;

  const trackerRef = useRef<NarrativeLineTracker>({
    recentLines: [],
    maxRecent,
    usageCount: {},
    lastUsed: null,
  });

  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  const pickFreshLine = useCallback((): string => {
    const tracker = trackerRef.current;
    if (!pool || pool.length === 0) {
      if (isDevEnv()) {
        console.warn('[Narrative] Pool is empty!', { pool, context: options });
      }
      return fallbackLine;
    }

    // Remove empty lines from pool at runtime (defensive)
    const filteredPool = pool.filter(Boolean);
    if (filteredPool.length === 0) {
      if (isDevEnv()) {
        console.warn('[Narrative] All lines in pool are blank!', { pool, context: options });
      }
      return fallbackLine;
    }

    // Filter out recently used lines
    const freshLines = filteredPool.filter(
      (line) => !tracker.recentLines.includes(line)
    );

    // If all lines are used, reset buffer and optionally call exhaustion callback
    if (freshLines.length === 0) {
      tracker.recentLines = [];
      if (onExhaustion) onExhaustion();
      if (isDevEnv()) {
        console.warn('[Narrative] Pool exhausted, buffer reset.', { pool, context: options });
      }
      // --- Never repeat lastUsed after reset unless pool size is 1 ---
      const selectable =
        filteredPool.length > 1
          ? filteredPool.filter(line => line !== tracker.lastUsed)
          : filteredPool;
      const selected = selectable[Math.floor(Math.random() * selectable.length)];
      tracker.lastUsed = selected;
      tracker.recentLines.push(selected);
      tracker.usageCount[selected] = (tracker.usageCount[selected] || 0) + 1;
      setUsageStats({ ...tracker.usageCount });
      if (!selected && isDevEnv()) {
        console.error('[Narrative] Fallback failed: No selectable lines after buffer reset!', { pool, context: options });
      }
      return selected || fallbackLine;
    }

    // Pick from fresh lines
    const selected = freshLines[Math.floor(Math.random() * freshLines.length)];
    tracker.lastUsed = selected;
    tracker.recentLines.push(selected);
    if (tracker.recentLines.length > tracker.maxRecent) {
      tracker.recentLines.shift();
    }
    tracker.usageCount[selected] = (tracker.usageCount[selected] || 0) + 1;
    setUsageStats({ ...tracker.usageCount });
    if (!selected && isDevEnv()) {
      console.error('[Narrative] Fallback failed: No selectable lines in freshLines!', { pool, context: options });
    }
    return selected || fallbackLine;
  }, [pool, maxRecent, fallbackLine, onExhaustion]);

  const reset = useCallback(() => {
    trackerRef.current = {
      recentLines: [],
      maxRecent,
      usageCount: {},
      lastUsed: null,
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
  pools: Record<PoolName, string[]>,
  config: {
    maxRecent?: PoolConfig;
    fallbackLine?: string | Record<PoolName, string>;
    onExhaustion?: ((poolName: PoolName) => void) | undefined;
  } = {}
) {
  const getMaxRecent = (poolName: PoolName) => {
    if (typeof config.maxRecent === 'number') return config.maxRecent;
    if (config.maxRecent && config.maxRecent[poolName])
      return config.maxRecent[poolName];
    return 3;
  };

  const getFallback = (poolName: PoolName) => {
    if (typeof config.fallbackLine === 'string') return config.fallbackLine;
    if (config.fallbackLine && config.fallbackLine[poolName])
      return config.fallbackLine[poolName];
    return '<No lines available>';
  };

  const trackersRef = useRef<Record<PoolName, NarrativeLineTracker>>({});
  const [usageStats, setUsageStats] = useState<
    Record<PoolName, Record<string, number>>
  >({});

  const pickFreshLine = useCallback(
    (poolName: PoolName): string => {
      const pool = pools[poolName];
      if (!pool || pool.length === 0) {
        if (isDevEnv()) {
          console.warn(`Narrative pool "${poolName}" is empty!`);
        }
        return getFallback(poolName);
      }

      // Remove empty lines defensively
      const filteredPool = pool.filter(Boolean);
      if (filteredPool.length === 0) {
        if (isDevEnv()) {
          console.warn(`Narrative pool "${poolName}" only has blank lines!`);
        }
        return getFallback(poolName);
      }

      // Initialize tracker for this pool if not exists
      if (!trackersRef.current[poolName]) {
        trackersRef.current[poolName] = {
          recentLines: [],
          maxRecent: getMaxRecent(poolName),
          usageCount: {},
          lastUsed: null,
        };
      }

      const tracker = trackersRef.current[poolName];
      // Filter out recently used lines
      const freshLines = filteredPool.filter(
        (line) => !tracker.recentLines.includes(line)
      );

      // If all lines have been used, reset buffer and log/callback
      if (freshLines.length === 0) {
        tracker.recentLines = [];
        if (config.onExhaustion) config.onExhaustion(poolName);
        if (isDevEnv()) {
          console.warn(
            `Narrative pool "${poolName}" exhausted, buffer reset.`
          );
        }
        // --- Never repeat lastUsed after reset unless pool size is 1 ---
        const selectable =
          filteredPool.length > 1
            ? filteredPool.filter(line => line !== tracker.lastUsed)
            : filteredPool;
        const selected = selectable[Math.floor(Math.random() * selectable.length)];
        tracker.lastUsed = selected;
        tracker.recentLines.push(selected);
        tracker.usageCount[selected] = (tracker.usageCount[selected] || 0) + 1;
        setUsageStats((prev) => ({
          ...prev,
          [poolName]: { ...tracker.usageCount },
        }));
        return selected;
      }

      // Pick from fresh lines
      const selected =
        freshLines[Math.floor(Math.random() * freshLines.length)];
      tracker.lastUsed = selected;
      tracker.recentLines.push(selected);
      if (tracker.recentLines.length > tracker.maxRecent) {
        tracker.recentLines.shift();
      }
      tracker.usageCount[selected] = (tracker.usageCount[selected] || 0) + 1;
      setUsageStats((prev) => ({
        ...prev,
        [poolName]: { ...tracker.usageCount },
      }));
      return selected;
    },
    [pools, config]
  );

  const reset = useCallback((poolName?: PoolName) => {
    if (poolName) {
      trackersRef.current[poolName] = {
        recentLines: [],
        maxRecent: getMaxRecent(poolName),
        usageCount: {},
        lastUsed: null,
      };
      setUsageStats((prev) => ({
        ...prev,
        [poolName]: {},
      }));
    } else {
      trackersRef.current = {};
      setUsageStats({});
    }
  }, [config]);

  const getUsageStats = useCallback((poolName?: PoolName) => {
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
    }, {} as Record<string, unknown>);
  }, [pools]);

  return {
    pickFreshLine,
    reset,
    getUsageStats,
    usageStats
  };
} 