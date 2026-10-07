#!/usr/bin/env node
'use strict';
const crypto=require('crypto'),fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
function verifyAudit(rootDir){
 const root=path.resolve(rootDir),auditDir=path.join(root,'evidence','security-audit-v1.5.1');
 const readJson=n=>JSON.parse(fs.readFileSync(path.join(auditDir,n),'utf8'));
 const blob=(ref,rel)=>{try{return execFileSync('git',['show',`${ref}:${rel}`],{cwd:root,encoding:null,maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']});}catch(_){throw new Error(`AUDITED_GIT_BLOB_MISSING:${ref}:${rel}`);}};
 const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
 const findings=readJson('findings.json'),coverage=readJson('coverage-ledger.json'),scope=readJson('audited-scope-sha256.json');
 if(findings.schema_version!==1)throw new Error('AUDIT_FINDINGS_SCHEMA');
 if(coverage.schema_version!==1)throw new Error('AUDIT_COVERAGE_SCHEMA');
 if(scope.schema_version!==1)throw new Error('AUDIT_SCOPE_SCHEMA');
 if(findings.confirmed_release_blockers!==0)throw new Error('CONFIRMED_SECURITY_RELEASE_BLOCKER');
 if(findings.confirmed_count!==0)throw new Error('CONFIRMED_SECURITY_FINDING');
 if(!Array.isArray(findings.candidates))throw new Error('AUDIT_CANDIDATES_MISSING');
 if(!Array.isArray(coverage.coverage_limitations))throw new Error('AUDIT_LIMITATIONS_MISSING');
 if(findings.audited_source_ref!==coverage.audited_source_ref||findings.audited_source_ref!==scope.audited_source_ref)throw new Error('AUDIT_SOURCE_REF_MISMATCH');
 for(const c of findings.candidates){if(!['confirmed','needs_validation','rejected'].includes(c.classification))throw new Error('AUDIT_CLASSIFICATION_INVALID:'+c.id);if(typeof c.independent_verifier!=='string'||!c.independent_verifier.trim())throw new Error('AUDIT_VERIFIER_MISSING:'+c.id);}
 for(const [rel,expected] of Object.entries(scope.files||{})){const a=sha(blob(scope.audited_source_ref,rel)),h=sha(blob('HEAD',rel));if(a!==expected)throw new Error('AUDIT_MANIFEST_SOURCE_MISMATCH:'+rel);if(h!==expected)throw new Error('AUDITED_SCOPE_CHANGED:'+rel);}
 console.log('SECURITY_AUDIT=NO_CONFIRMED_RELEASE_BLOCKER');console.log('CONFIRMED=0');console.log('NEEDS_VALIDATION='+findings.needs_validation_count);console.log('AUDITED_SOURCE_REF='+findings.audited_source_ref);return{findings,coverage,scope};
}
if(require.main===module)verifyAudit(path.resolve(__dirname,'..'));module.exports={verifyAudit};
