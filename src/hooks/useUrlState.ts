import { useCallback, useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useUrlState<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Parse value from URL
  const getUrlValue = useCallback(() => {
    const val = searchParams.get(key);
    if (val !== null) {
      if (Array.isArray(initialValueRef.current)) {
        return val.split(",") as unknown as T;
      }
      if (typeof initialValueRef.current === "number") {
        return Number(val) as unknown as T;
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

  // Sync from URL to state if URL changes externally (e.g. back button)
  const stateStr = JSON.stringify(state);
  const urlValStr = JSON.stringify(getUrlValue());
  
  useEffect(() => {
    if (stateStr !== urlValStr) {
      setState(getUrlValue());
    }
  }, [urlValStr, stateStr, getUrlValue]);

  const setUrlState = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      const prev = stateRef.current;
      const computedVal = typeof newVal === "function" ? (newVal as Function)(prev) : newVal;

      setState(computedVal);
      // Immediately update ref so consecutive synchronous calls see the newest state
      stateRef.current = computedVal;

      setSearchParams(
        (prevParams) => {
          const nextParams = new URLSearchParams(prevParams);

          let stringVal = "";
          if (Array.isArray(computedVal)) {
            stringVal = computedVal.join(",");
          } else if (typeof computedVal === "object" && computedVal !== null) {
            stringVal = JSON.stringify(computedVal);
            if (Object.keys(computedVal).length === 0) stringVal = "";
          } else {
            stringVal = String(computedVal);
          }

          if (
            stringVal === "" ||
            stringVal === "[]" ||
            computedVal === null ||
            computedVal === undefined ||
            // Don't clutter URL with default values
            (typeof computedVal !== 'object' && computedVal === initialValue) ||
            (Array.isArray(computedVal) && computedVal.length === 0) ||
            (typeof computedVal === 'object' && JSON.stringify(computedVal) === JSON.stringify(initialValue))
          ) {
            nextParams.delete(key);
          } else {
            nextParams.set(key, stringVal);
          }
          
          return nextParams;
        },
        { replace: true }
      );
    },
    [key, setSearchParams, initialValue]
  );

  return [state, setUrlState];
}
