import program, { CommanderStatic } from "commander";
import { parseConfigFile } from "./utils";

import { compiler } from "./lib/compiler";
import { bundle } from "./lib/bundler";
import { startServer } from "./lib/serve";

export const cli = (process: NodeJS.Process): CommanderStatic => {
  program
    .command("build <path>")
    .option("-c, --config_file <path>", "Path to your stasis.config.json file")
    .description("Create a production build")
    .action(async (cmd, options) => {
      const stasisConfig = await parseConfigFile(options.config_file);
      const compilationPromise = compiler(stasisConfig);
      const bundlePromise = bundle(stasisConfig);
      await Promise.all([compilationPromise, bundlePromise]);
    });

  program
    .command("serve <path>")
    .option("-c, --config_file <path>", "Path to your stasis.config.json file")
    .description("Start development server")
    .action(async (cmd, options) => {
      const stasisConfig = await parseConfigFile(options.config_file);
      const compilationPromise = compiler(stasisConfig);
      const bundlePromise = bundle(stasisConfig);
      await Promise.all([compilationPromise, bundlePromise]);
      // noinspection JSIgnoredPromiseFromCall
      startServer(stasisConfig, {});
    });

  program.parse(process.argv);
  return program;
};
