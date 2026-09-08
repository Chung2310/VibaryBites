import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const launcher=resolve('scripts/run-next.mjs');
test('launcher uses .env PORT, fallback and explicit CLI override',()=>{
 const dir=mkdtempSync(join(tmpdir(),'vibary-port-'));
 try {
  // Replace only the spawned Next process with an argument recorder in this child.
  const mock=join(dir,'mock.mjs');
  writeFileSync(mock,`import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';import {EventEmitter} from 'node:events';cp.spawn=(_cmd,args,options)=>{console.log(JSON.stringify({args,port:options.env.PORT}));return new EventEmitter()};syncBuiltinESMExports();`);
  const run=(extra=[],env={})=>{
   const vars={...process.env};delete vars.PORT;Object.assign(vars,env);
   return spawnSync(process.execPath,['--import',pathToFileURL(mock).href,launcher,'start',...extra],{cwd:dir,env:vars,encoding:'utf8'});
  };
  const port=result=>{assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout.trim()).port};
  assert.equal(port(run()),'3009');
  writeFileSync(join(dir,'.env'),'PORT="4123"\n');assert.equal(port(run()),'4123');
  assert.equal(port(run([], {PORT:'4222'})),'4222');
  writeFileSync(join(dir,'.env.local'),'PORT=4333\n');assert.equal(port(run()),'4333');
  rmSync(join(dir,'.env.local'));
  assert.equal(port(run(['--port','4210'])),'4210');
  writeFileSync(join(dir,'.env'),'PORT=\n');assert.equal(port(run()),'3009');
  writeFileSync(join(dir,'.env'),'PORT=70000\n');assert.equal(run().status,1);
  assert.equal(port(run(['-p','4211'])),'4211');
 } finally {rmSync(dir,{recursive:true,force:true});}
});
