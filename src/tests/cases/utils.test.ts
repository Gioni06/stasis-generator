import assert from 'assert'
import path from 'path'
import { parseConfigFile } from "../../utils";

import { TCase } from ".";

export function testLoadRaptorConfig(): TCase {
	async function run() {
		const config = await parseConfigFile(path.resolve(__dirname, '../fixtures/test-project/raptorgen.config.json'))
		try {
			assert.deepEqual(config, {
				assetsPath: 'assets',
				basePath: path.resolve(__dirname, '../fixtures/test-project'),
				entryAssets: [ '**/*' ],
				publicPath: 'dist',
				sourcePath: 'src',
				staticPath: 'static'
			})
			return true
		} catch(e) {
			throw e
		}
	}

	return {
		description: 'It can load a config file',
		run
	}
}