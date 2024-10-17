import os from "node:os";
import type { SystemInfo } from "../models/record-attachment";

export const constructSystemInfo = async (): Promise<SystemInfo> => {
  let previousTime = new Date().getTime();
  let previousUsage = process.cpuUsage();

  return new Promise<SystemInfo>((resolve) => {
    setInterval(() => {
      const currentUsage = process.cpuUsage(previousUsage);

      previousUsage = process.cpuUsage();

      // we can't do simply times / 10000 / ncpu because we can't trust
      // setInterval is executed exactly every 1.000.000 microseconds
      const currentTime = new Date().getTime();
      // times from process.cpuUsage are in microseconds while delta time in milliseconds
      // * 10 to have the value in percentage for only one cpu
      // * ncpu to have the percentage for all cpus af the host

      // this should match top's %CPU
      const timeDelta = (currentTime - previousTime) * 10;
      // this would take care of CPUs number of the host
      // const timeDelta = (currentTime - previousTime) * 10 * ncpu;
      const { user, system } = currentUsage;

      const lastUsage = {
        system: system / timeDelta,
        total: (system + user) / timeDelta,
        user: user / timeDelta,
      };
      previousTime = currentTime;

      resolve({
        cpu_usage: lastUsage.total,
        free_memory: os.freemem(),
        total_memory: os.totalmem(),
      });
    }, 500);
  });
};
