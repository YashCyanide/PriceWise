"use client";

import { useEffect } from "react";

export default function CronInitializer() {
  useEffect(() => {
    fetch('/api/cron-init')
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error('Cron init error:', err));
  }, []);

  return null;
}
