import program, { CommanderStatic } from 'commander'
import { parseConfigFile } from './utils';
import { compiler } from './lib/compiler';
 
export const cli = (process: NodeJS.Process): CommanderStatic => {
  program
    .option('-p', '--pwd <path>', 'Current working directory')
    .option('-t', '--test', 'Just a test flag');

  program
    .command('build <path>')
    .option("-s, --source_config <path>", "The source of the project")
    .description('Run the compiler')
    .action(async function(cmd, options){
       const raptorConfig = await parseConfigFile(options.source_config )
       await compiler(raptorConfig)
    });

  program.parse(process.argv)
  return program
} 
