import chokidar from 'chokidar'
import debounce from 'lodash/debounce'
import { compiler } from './compiler';
import { bundle } from './bundler';
const micro = require('micro')
const handler = require('serve-handler')

export const startServer = async (raptorConfig: any, flags: any) => {

	const options = {
         public: raptorConfig.basePath + '/' + raptorConfig.publicPath,
         srcPath: raptorConfig.basePath + '/' + raptorConfig.sourcePath
    }
	
	const server = micro(async (request: any, response: any) => {
		return handler(request, response, {
  		public: options.public,
			trailingSlash: false,
			cleanUrls: true
	});
	})

	chokidar.watch(options.srcPath, { ignoreInitial: true }).on(
    'all',
    debounce(async () => {	
      await compiler(raptorConfig);
	  await bundle(raptorConfig)
      console.log('Waiting for changes...');
    }, 500)
  );

	server.listen(3000, () => {
		console.log('Running at http://localhost:3000');
	})
}