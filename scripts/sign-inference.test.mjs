import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseInferenceResponse,inferenceEndpoint,inferSignWindow} from '../src/sign-inference.ts';
test('only exact request matches produce validated bounded candidates',()=>{
 const candidates=Array.from({length:5},(_,i)=>({id:String(i),label:`표현 ${i}`,score:i/5}));
 assert.deepEqual(parseInferenceResponse({requestId:'r',candidates:[...candidates,candidates[4]]},'r').map(c=>c.id),['4','3','2']);
 for(const value of [{requestId:'old',candidates:[]},{requestId:'r',candidates:[{label:'허위',score:NaN}]},{requestId:'r',candidates:[{label:' ',score:.5}]},{requestId:'r',candidates:[{label:'범위',score:2}]}])assert.throws(()=>parseInferenceResponse(value,'r'));
 assert.deepEqual(parseInferenceResponse({requestId:'r',candidates:[]},'r'),[]);
});
test('server configuration rejects credentials, query secrets, insecure and invalid URLs',()=>{
 const origin='https://app.example';assert.equal(inferenceEndpoint('',origin),null);assert.equal(inferenceEndpoint('https://inference.example/predict',origin),'https://inference.example/predict');assert.equal(inferenceEndpoint('/predict',origin),'https://app.example/predict');
 for(const url of ['http://inference.example','https://name:pass@example.com','https://example.com?key=secret','https://example.com#fragment','javascript:alert(1)'])assert.equal(inferenceEndpoint(url,origin),null);
 assert.equal(inferenceEndpoint('http://127.0.0.1:8000/predict','http://localhost:8095'),'http://127.0.0.1:8000/predict');assert.equal(inferenceEndpoint('http://localhost:8000',origin),null);
});
test('transport sends only coordinate frames without cookies or raw media',async()=>{
 const payload={schemaVersion:1,sessionId:'session',requestId:'request',image:{width:640,height:480},coordinates:{space:'normalized',mirrored:false},frames:[{timestampMs:123,leftHand:[],rightHand:[],pose:[],face:[]}]};const controller=new AbortController();let sent;
 globalThis.fetch=async(url,options)=>{sent={url,...options};return {ok:true,json:async()=>({requestId:'request',candidates:[{label:'안녕하세요',score:.8}]})}};
 const result=await inferSignWindow('https://inference.example/predict',payload,controller.signal);assert.equal(result[0].label,'안녕하세요');assert.equal(sent.credentials,'omit');assert.equal(sent.redirect,'error');assert.equal(sent.signal,controller.signal);assert.deepEqual(JSON.parse(sent.body),payload);assert.equal(sent.body.includes('blob:'),false);
});
test('network errors, aborted requests and malformed responses are not results',async()=>{
 const controller=new AbortController(),payload={requestId:'r'};
 globalThis.fetch=async()=>({ok:false});await assert.rejects(inferSignWindow('https://example.com',payload,controller.signal));
 globalThis.fetch=async()=>({ok:true,json:async()=>({requestId:'old',candidates:[]})});await assert.rejects(inferSignWindow('https://example.com',payload,controller.signal));
 globalThis.fetch=async()=>{throw new DOMException('aborted','AbortError')};await assert.rejects(inferSignWindow('https://example.com',payload,controller.signal));
});
