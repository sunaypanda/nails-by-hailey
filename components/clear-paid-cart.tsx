"use client";
import { useEffect } from "react";
import { useStore } from "./store-provider";
export function ClearPaidCart() { const { clear, ready } = useStore(); useEffect(() => { if (ready) clear(); /* Runs only when a verified paid receipt mounts. */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]); return null; }
