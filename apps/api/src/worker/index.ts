import "dotenv/config"; // carga apps/api/.env antes que nada
import cron from "node-cron";
import { runTick } from "./scheduler.js";

const expr = process.env.NOTIFY_CRON ?? "*/15 * * * *";

if (!cron.validate(expr)) {
  console.error(`[worker] NOTIFY_CRON inválido: "${expr}"`);
  process.exit(1);
}

console.log(`🌿 Savia worker iniciado — cron "${expr}"`);

// Ejecuta un tick al arrancar y luego en cada cron.
runTick().catch((err) => console.error("[worker] error en tick inicial:", err));

cron.schedule(expr, () => {
  runTick().catch((err) => console.error("[worker] error en tick:", err));
});
