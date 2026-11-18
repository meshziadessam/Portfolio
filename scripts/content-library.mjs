import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

import matter from 'gray-matter';

export const revision = text => createHash('sha256').update(text).digest('hex');

export async function contentLibrary(request,response) {
  if(request.method !== 'GET') {response.writeHead(405);response.end();return;}
  try {
    const entries=[];
    for(const kind of ['writeups','projects']) {
      const directory=new URL('../content/'+kind+'/',import.meta.url);
      for(const file of await readdir(directory)) {
        if(!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(mdx|json)$/.test(file)) continue;
        const raw=await readFile(new URL(file,directory),'utf8');
        const parsed=kind==='projects'?{data:JSON.parse(raw)}:matter(raw);
        const data=parsed.data;
        entries.push({
          kind,slug:file.replace(/\.(mdx|json)$/,''),title:data.title,description:data.description,category:data.category,
          date:data.date||'',published:data.published===true,revision:revision(raw),
          content:kind==='projects'?data.markdown||'':parsed.content,
          sections:kind==='projects'?data.sections||[]:[],
        });
      }
    }
    response.writeHead(200,{'Content-Type':'application/json'});
    response.end(JSON.stringify(entries));
  } catch(error) {
    console.error(error);
    response.writeHead(500,{'Content-Type':'application/json'});
    response.end(JSON.stringify({error:'Could not read content library.'}));
  }
}
