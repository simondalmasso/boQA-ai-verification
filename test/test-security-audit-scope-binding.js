'use strict';
const assert=require('assert'),crypto=require('crypto'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'evidence','security-audit-v1.5.0','audited-scope-sha256.json'),'utf8'));
assert.equal(manifest.schema_version,1);assert.match(manifest.audited_source_ref,/^[0-9a-f]{40}$/);assert(manifest.files&&typeof manifest.files==='object');
const blob=(ref,rel)=>execFileSync('git',['show',`${ref}:${rel}`],{cwd:root,encoding:null,maxBuffer:32*1024*1024});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [rel,expected] of Object.entries(manifest.files)){assert.equal(sha(blob(manifest.audited_source_ref,rel)),expected,'audit manifest does not match audited source ref: '+rel);assert.equal(sha(blob('HEAD',rel)),expected,'audited scope changed without audit refresh: '+rel);}
console.log('security audit scope binding: PASS');
