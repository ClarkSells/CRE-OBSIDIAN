declare module "sql.js/dist/sql-asm.js" {
  import type { SqlJsStatic, SqlJsConfig } from "sql.js";
  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
