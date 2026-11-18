import mammoth from 'mammoth';
import Turndown from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import {randomUUID,createHash} from 'node:crypto';
import {store} from './save-content.mjs';

export async function parseWord(buffer,filename,kind) {
  const slug=filename.replace(/\.docx$/i,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'document';
  const id=slug+'-'+createHash('sha256').update(buffer).digest('hex').slice(0,10);
  const assets=[];
  const converted=await mammoth.convertToHtml({buffer},{
    styleMap:["p[style-name='Title'] => h1:fresh"],
    convertImage:mammoth.images.imgElement(async image=>{
      const extension={'image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/webp':'webp'}[image.contentType];
      if(!extension) throw new Error('Unsupported embedded image: '+image.contentType);
      const bytes=await image.read();
      if(bytes.length>10*1024*1024) throw new Error('An embedded image exceeds 10 MB.');
      const name=id+'-'+randomUUID()+'.'+extension;
      assets.push({name,bytes,type:image.contentType});
      return {src:'/images/content/'+name};
    }),
  });
  const converter=new Turndown({headingStyle:'atx',codeBlockStyle:'fenced'});
  converter.use(gfm);
  const content=converter.turndown(converted.value);
  if(!content.trim()) throw new Error('No readable content was found.');
  const title=content.match(/^# (.+)$/m)?.[1]||filename.replace(/\.docx$/i,'').replace(/[_-]/g,' ');
  const description=content.split('\n').find(line=>line.trim()&&!/^[#!|]/.test(line))?.replace(/[*_`]/g,'').slice(0,250)||title;
  const data=new FormData();
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  Object.entries({kind,slug:id,title,description,category:kind==='projects'?'Project':'Writeup',date,published:'on',content})
    .forEach(([key,value])=>data.set(key,value));
  for(const asset of assets) data.set('asset:'+asset.name,new File([asset.bytes],asset.name,{type:asset.type}));
  return {data,warnings:converted.messages.map(message=>message.message)};
}

export async function importWord(request,response,origin) {
  const reply=(status,data)=>{response.writeHead(status,{'Content-Type':'application/json'});response.end(JSON.stringify(data));};
  if(request.method!=='POST'||request.headers.origin!==origin) return reply(403,{error:'Open the local editor to import documents.'});
  try {
    const chunks=[];
    let size=0;
    for await(const chunk of request.iterator({destroyOnReturn:false})) {
      size+=chunk.length;
      if(size>25*1024*1024) return reply(413,{error:'Choose a document under 25 MB.'});
      chunks.push(chunk);
    }
    const form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':request.headers['content-type']}}).formData();
    const file=form.get('document');
    const kind=form.get('kind');
    if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.docx')||!['projects','writeups'].includes(kind)) return reply(400,{error:'Choose a .docx file and a destination.'});
    const {data,warnings}=await parseWord(Buffer.from(await file.arrayBuffer()),file.name,kind);
    reply(201,{path:await store(data),warnings});
  } catch(error) {reply(error.status||400,{error:error.message||'Import failed.'});}
}
