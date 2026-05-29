import { useCallback, useState, useRef, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

let pendingParams: URLSearchParams | null = null;
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

export function useUrlState<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stringifiedInitialValue = JSON.stringify(initialValue);
  const initialValueRef = useRef(initialValue);
  
  useEffect(() => {
    try {
      if (stringifiedInitialValue) {
        initialValueRef.current = JSON.parse(stringifiedInitialValue);
      } else {
        initialValueRef.current = initialValue;
      }
    } catch {
      initialValueRef.current = initialValue;
    }
  }, [stringifiedInitialValue, initialValue]);


  // Parse value from URL
  const getUrlValue = useCallback(() => {
    const val = searchParams.get(key);
    if (val !== null) {
      if (Array.isArray(initialValueRef.current)) {
        if (val.trim() === "") return [] as unknown as T;
        return val.split(",").filter(v => v.trim() !== "") as unknown as T;
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
      if (typeof initialValueRef.current === "object") {
        try {
          return JSON.parse(val) as T;
        } catch {
          return initialValueRef.current;
        }
      }
      return val as unknown as T;
    }
    return initialValueRef.current;
  }, [key, searchParams]);

  // Use state to prevent unnecessary re-renders when url changes but value is same
  const [state, setState] = useState<T>(getUrlValue());

  const stateRef = useRef(state);
  stateRef.current = state;
  const skipSyncRef = useRef(false);

  // Sync from URL to state if URL changes externally (e.g. back button)
  const stateStr = JSON.stringify(state);
  const urlValStr = JSON.stringify(getUrlValue());
  
  useEffect(() => {
    if (!skipSyncRef.current && stateStr !== urlValStr) {
      const nextVal = getUrlValue();
      if (JSON.stringify(state) !== JSON.stringify(nextVal)) {
        setState(nextVal);
      }
    }
  }, [urlValStr, stateStr, getUrlValue, state]);

  const setUrlState = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      const prev = stateRef.current;
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
