import { stringify } from "querystring";

const Bundler = require('parcel-bundler')
const glob = require('glob')

export const bundle = async (raptorConfig: { [key: string]: any}) => {
	  
	  // lookup files to bundle
	  let files: string[]  
	  if(Array.isArray(raptorConfig.entryAssets)) {
		  files = raptorConfig.entryAssets.reduce((res, value, index) => {
			  	const f = glob.sync( value, { cwd: raptorConfig.basePath + '/' + raptorConfig.sourcePath + '/' + raptorConfig.assetsPath })
				return res = [...res, ...f]
		  }, [])
	  } else {
		  files = glob.sync(raptorConfig.entryAssets, { cwd: raptorConfig.basePath + '/' + raptorConfig.sourcePath + '/' + raptorConfig.assetsPath })
	  }

	// create bundler options
	const options = {
		outDir: raptorConfig.basePath + '/' + raptorConfig.publicPath + '/' + raptorConfig.assetsPath,
		cache: false,
		target: 'browser',
		sourceMaps: true,
		logLevel: 1,
		detailedReport: false,
		watch: false
	}

	const entryFiles = files.map(f => raptorConfig.basePath + '/' + raptorConfig.sourcePath + '/' + raptorConfig.assetsPath + '/' + f)

	 const bundler = new Bundler(entryFiles, options);
	 return bundler.bundle();  
}