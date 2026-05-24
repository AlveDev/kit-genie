import * as React from "react";
import { dbSubscribe } from "@/services/db";

/** Faz selector reativo sobre o "banco" mockado. */
export function useDb<T>(selector: () => T): T {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => dbSubscribe(() => force()), []);
  return selector();
}
