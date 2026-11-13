import React from 'react';
import { Outlet } from 'react-router-dom';

// One nested route tree per bottom tab. Keeping each tab's pages under its own
// stack gives every tab an independent navigation tree while preserving URLs.
export default function TabStack() {
  return <Outlet />;
}