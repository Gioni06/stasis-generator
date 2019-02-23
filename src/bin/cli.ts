#!/usr/bin/env node

import { cli } from "../index";

try {
  const program = cli(process);
  if (program.Config) {
    console.log("  - config");
  }
  if (program.Pwd) {
    console.log("  - pwd");
  }
  if (program.Test) {
    console.log("  - test");
  }
} catch (e) {
  console.log(e);
  process.exit(1);
}
