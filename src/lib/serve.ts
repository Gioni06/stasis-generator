import chokidar from 'chokidar'
import debounce from 'lodash/debounce'
import { bundle } from './bundler';
import { compiler } from './compiler';

const micro = require('micro')
const handler = require('serve-handler')

export const startServer = async (raptorConfig: any, flags: any) => {

	const options = {
         public: raptorConfig.basePath + '/' + raptorConfig.publicPath,
         srcPath: raptorConfig.basePath + '/' + raptorConfig.sourcePath
    }
	
	const server = micro(async (request: any, response: any) => {
		return handler(request, response, {
			cleanUrls: true,
			trailingSlash: false,
  		public: options.public
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