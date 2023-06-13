import chalk from "chalk";

import {
  testClearDistDirectory,
  testGeneratesPrettyUrls,
  testRendersPageWithCustomLayout,
  testRendersPageWithDefaultLayout,
  testCopyStaticFolder,
  testCopyRootFiles
} from "./compiler.test";
import { testLoadStasisConfig } from "./utils.test";
import { assert } from "console";

export interface TCase {
  description: string;
  run(): Promise<boolean>;
}
/**
 *
 * @param tCase Promise<boolean>
 */
export async function test(tCase: TCase): Promise<boolean | undefined> {
  try {
    console.log(chalk.gray(tCase.description));
    const result = await tCase.run();

    if (result) {
      console.log(chalk.green("success"));
    } else {
      console.log(chalk.red(tCase.description));
    }

    return result;
  } catch (e) {
    if (e instanceof Error) {
      console.error(chalk.red(e.message));
      console.error(e.stack);
    }
  }
}

export async function executeSyncTests(testCases: TCase[]) {
  for (const i of testCases) {
    try {
      await test(i);
    } catch (e) {
      if (e instanceof Error) {
        console.error(chalk.red(e.message));
        console.error(e.stack);
      }
    }
  }
}

(async () => {
  try {
    await executeSyncTests([testLoadStasisConfig()]);
    await executeSyncTests([testClearDistDirectory()]);
    await executeSyncTests([
      testRendersPageWithDefaultLayout(),
      testRendersPageWithCustomLayout(),
      testGeneratesPrettyUrls(),
      testCopyStaticFolder(),
      testCopyRootFiles()
    ]);
  } catch (e) {
    throw e;
  }
})();
