import { TCase } from ".";
import path from 'path'
import assert from 'assert'
import { parseConfigFile } from "../../utils";

export function testLoadRaptorConfig(): TCase {
	async function run() {
		const config = await parseConfigFile(path.resolve(__dirname, '../fixtures/test-project/raptorgen.config.json'))
		try {
			assert.deepEqual(config, {
				sourcePath: 'src',
				publicPath: 'dist',
				assetsPath: 'assets',
				staticPath: 'static',
				entryAssets: [ '**/*' ],
				basePath: path.resolve(__dirname, '../fixtures/test-project')
			})
			return true
		} catch(e) {
			throw e
		}
	}

	return {
		run: run,
		description: 'It can load a config file'
	}
}