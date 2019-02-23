import program, { CommanderStatic } from "commander";
import { parseConfigFile } from "./utils";

import { compiler } from "./lib/compiler";
import { bundle } from "./lib/bundler";
import { startServer } from "./lib/serve";

export const cli = (process: NodeJS.Process): CommanderStatic => {
  program
    .option("-p", "--pwd <path>", "Current working directory")
    .option("-t", "--test", "Just a test flag");

  program
    .command("build <path>")
    .option("-s, --source_config <path>", "The source of the project")
    .description("Run the compiler")
    .action(async (cmd, options) => {
      const raptorConfig = await parseConfigFile(options.source_config);
      const compilationPromise = compiler(raptorConfig);
      const bundlePromise = bundle(raptorConfig);
      await Promise.all([compilationPromise, bundlePromise]);
    });

  program
    .command("serve <path>")
    .option("-s, --source_config <path>", "The source of the project")
    .description("Start server")
    .action(async (cmd, options) => {
      const raptorConfig = await parseConfigFile(options.source_config);
      const compilationPromise = compiler(raptorConfig);
      const bundlePromise = bundle(raptorConfig);
      await Promise.all([compilationPromise, bundlePromise]);
      startServer(raptorConfig, {});
    });

  program.parse(process.argv);
  return program;
};
