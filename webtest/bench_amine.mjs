import * as ort from 'onnxruntime-web'; import { readFileSync } from 'node:fs';
ort.env.wasm.numThreads = 1;
const R=2,T=2016,H=96;
const feeds={x:new ort.Tensor('float32',Float32Array.from({length:R*T},(_,i)=>Math.sin(i/13)+Math.random()*0.1),[R,T]),
 obs:new ort.Tensor('bool',new Uint8Array(R*T).fill(1),[R,T]), group_ids:new ort.Tensor('int64',BigInt64Array.from([0n,1n]),[R]),
 role_ids:new ort.Tensor('int64',new BigInt64Array(R),[R]), known_future:new ort.Tensor('float32',new Float32Array(R*H),[R,H]),
 known_future_mask:new ort.Tensor('bool',new Uint8Array(R*H),[R,H])};
for (const f of ['/home/claude/community/dl/amine40__Timestral-5M-ONNX/timestral-5m.onnx','/home/claude/community/dl/amine40__Timestral-28M-ONNX/timestral-28m.onnx']) {
 const sess=await ort.InferenceSession.create(readFileSync(f).buffer,{executionProviders:['wasm']}); await sess.run(feeds);
 const ts=[]; for(let i=0;i<5;i++){const s=performance.now(); await sess.run(feeds); ts.push(performance.now()-s);} console.log(f.split('/').pop(), Math.min(...ts).toFixed(0)+'ms'); }
