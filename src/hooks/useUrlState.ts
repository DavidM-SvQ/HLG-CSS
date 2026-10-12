import { useCallback, useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

let pendingParams: URLSearchParams | null = null;
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

export function useUrlState<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stringifiedInitialValue = JSON.stringify(initialValue);
  const initialValueRef = useRef(initialValue);
  const stateRef = useRef<T | undefined>(undefined);

  // Synchronously update initialValueRef ONLY when stringifiedInitialValue actually changes (prevents render loops when passing inline objects/arrays)
  const prevStringifiedInitialRef = useRef(stringifiedInitialValue);
  if (prevStringifiedInitialRef.current !== stringifiedInitialValue) {
    prevStringifiedInitialRef.current = stringifiedInitialValue;
    try {
      initialValueRef.current = stringifiedInitialValue ? JSON.parse(stringifiedInitialValue) : initialValue;
    } catch {
      initialValueRef.current = initialValue;
    }
  }

  // Parse value from URL
  const getUrlValue = useCallback(() => {
    const val = searchParams.get(key);
    if (val !== null) {
      if (Array.isArray(initialValueRef.current)) {
        if (val.trim() === "") {
          if (Array.isArray(stateRef.current) && stateRef.current.length === 0) return stateRef.current;
          return initialValueRef.current;
        }
        const arr = val.split(",").filter(v => v.trim() !== "") as unknown as T;
        if (JSON.stringify(arr) === JSON.stringify(stateRef.current)) {
          return stateRef.current as T;
        }
        return arr;
      }
      if (typeof initialValueRef.current === "number") {
        if (val.trim() === "") return initialValueRef.current;
        const num = Number(val);
        if (isNaN(num)) return initialValueRef.current;
        return num as unknown as T;
      }
      if (typeof initialValueRef.current === "boolean") {
        return (val === "true") as unknown as T;
      }
      if (typeof initialValueRef.current === "object" && initialValueRef.current !== null) {
        try {
          const parsed = JSON.parse(val) as T;
          if (JSON.stringify(parsed) === JSON.stringify(stateRef.current)) {
            return stateRef.current as T;
          }
          return parsed;
        } catch {
          return initialValueRef.current;
        }
      }
      return val as unknown as T;
    }
    return initialValueRef.current;
  }, [key, searchParams]);

  // Use state to prevent unnecessary re-renders when url changes but value is same
  const [state, setState] = useState<T>(() => getUrlValue());

  if (state !== undefined) {
    stateRef.current = state;
  }
  const skipSyncRef = useRef(false);

  // Sync from URL to state if URL changes externally (e.g. back button)
  useEffect(() => {
    if (!skipSyncRef.current) {
      const nextVal = getUrlValue();
      if (JSON.stringify(stateRef.current) !== JSON.stringify(nextVal)) {
        setState(nextVal);
      }
    }
  }, [key, searchParams, getUrlValue]);

  const setUrlState = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      const prev = stateRef.current as T;
      const computedVal = typeof newVal === "function" ? (newVal as Function)(prev) : newVal;

      skipSyncRef.current = true;
      setState(computedVal);
      // Immediately update ref so consecutive synchronous calls see the newest state
      stateRef.current = computedVal;

      let stringVal = "";
      if (Array.isArray(computedVal)) {
        stringVal = computedVal.join(",");
      } else if (typeof computedVal === "object" && computedVal !== null) {
        stringVal = JSON.stringify(computedVal);
        if (Object.keys(computedVal).length === 0) stringVal = "";
      } else {
        stringVal = String(computedVal);
      }

      if (!pendingParams) {
        pendingParams = new URLSearchParams(window.location.search);
      }

      if (
        stringVal === "" ||
        stringVal === "[]" ||
        computedVal === null ||
        computedVal === undefined ||
        (typeof computedVal !== 'object' && computedVal === initialValueRef.current) ||
        (Array.isArray(computedVal) && computedVal.length === 0) ||
        (typeof computedVal === 'object' && JSON.stringify(computedVal) === JSON.stringify(initialValueRef.current))
      ) {
        pendingParams.delete(key);
      } else {
        pendingParams.set(key, stringVal);
      }

      if (flushTimeout) {
        clearTimeout(flushTimeout);
      }

      flushTimeout = setTimeout(() => {
        skipSyncRef.current = false;
        if (pendingParams) {
          navigate(`${window.location.pathname}?${pendingParams.toString()}${window.location.hash}`, { replace: true });
          pendingParams = null;
        }
      }, 0);
    },
    [key, navigate]
  );

  return [state, setUrlState];
}
