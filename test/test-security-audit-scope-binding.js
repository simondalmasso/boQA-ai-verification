'use strict';
const assert=require('assert'),crypto=require('crypto'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');

const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'evidence','security-audit-v1.5.1','audited-scope-sha256.json'),'utf8'));
const verifier=fs.readFileSync(path.join(root,'scripts','check-security-audit-evidence.js'),'utf8');

assert.equal(manifest.schema_version,1);
assert.match(manifest.audited_source_ref,/^[0-9a-f]{40}$/);
assert(manifest.files&&typeof manifest.files==='object');

// Portable exact-head binding: this must work even in a shallow CI checkout.
const blob=(ref,rel)=>execFileSync('git',['show',`${ref}:${rel}`],{cwd:root,encoding:null,maxBuffer:32*1024*1024});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [rel,expected] of Object.entries(manifest.files)){
  assert.equal(sha(blob('HEAD',rel)),expected,'audited scope changed without audit refresh: '+rel);
}

// Do not weaken provenance. The dedicated audit verifier, executed by the
// Security/Publication/Release gates with full history, must still prove that
// the seal also matches the recorded audited source ref.
assert(verifier.includes("blob(scope.audited_source_ref,rel)"),'full verifier must bind recorded audited source');
assert(verifier.includes('AUDIT_MANIFEST_SOURCE_MISMATCH'), 'full verifier must reject audited-source mismatch');
assert(verifier.includes('AUDITED_SCOPE_CHANGED'), 'full verifier must reject exact-head drift');

console.log('security audit exact-head scope binding: PASS');
