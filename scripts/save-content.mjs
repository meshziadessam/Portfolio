import { mkdir, writeFile, link, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const maxImage = 10 * 1024 * 1024;
const types = new Map([
  ['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp'],
  ['image/gif', 'gif'], ['image/avif', 'avif'],
]);

class SaveError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function receive(request) {
  const contentType = request.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data;')) throw new SaveError('Invalid upload format.');
  const limit = 50 * 1024 * 1024;
  const chunks = [];
  let size = 0;
  for await (const chunk of request.iterator({destroyOnReturn:false})) {
    size += chunk.length;
    if (size > limit) throw new SaveError('The save exceeds the 50 MB upload limit.', 413);
    chunks.push(chunk);
  }
  return new Response(Buffer.concat(chunks), {headers:{'Content-Type':contentType}}).formData();
}

async function store(data) {
  const field = name => {
    const value = data.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const kind = field('kind');
  const slug = field('slug');
  const title = field('title');
  const description = field('description');
  const category = field('category');
  const content = field('content');
  const date = field('date');
  if (!['writeups','projects'].includes(kind) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
    throw new SaveError('Choose a content type and a valid URL slug.');
  }
  if (!title || !description || !category || !content) throw new SaveError('Fill in the title, category, summary, and content.');
  if (kind === 'writeups' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new SaveError('Choose a publication date.');

  const assets = [];
  for (const [name, file] of data) {
    if (!name.startsWith('asset:')) continue;
    const filename = name.slice(6);
    const token = filename.slice(slug.length + 1, filename.lastIndexOf('.'));
    const extension = file instanceof File && types.get(file.type);
    if (!extension || file.size > maxImage || !/^[a-f0-9-]{36}$/.test(token) || filename !== slug + '-' + token + '.' + extension) {
      throw new SaveError('Invalid image upload. Choose a supported image up to 10 MB.');
    }
    assets.push({filename, file});
  }

  const filename = slug + (kind === 'writeups' ? '.mdx' : '.json');
  const directory = join(root, 'content', kind);
  const uploadDirectory = join(root, 'public', 'images', 'content');
  const temporary = join(directory, '.' + randomUUID() + '.tmp');
  const savedImages = [];
  const body = kind === 'writeups'
    ? ['---', 'title: ' + JSON.stringify(title), 'description: ' + JSON.stringify(description),
      'category: ' + JSON.stringify(category), 'format: markdown', 'date: ' + JSON.stringify(date),
      'published: ' + (field('published') === 'on'), '---', '', content, ''].join('\n')
    : JSON.stringify({title, description, category, visual:'artifact', demo:false, tools:[], sections:[], markdown:content}, null, 2) + '\n';

  await mkdir(directory, {recursive:true});
  try {
    await writeFile(temporary, body, {flag:'wx'});
    if (assets.length) await mkdir(uploadDirectory, {recursive:true});
    for (const {filename, file} of assets) {
      const path = join(uploadDirectory, filename);
      await writeFile(path, Buffer.from(await file.arrayBuffer()), {flag:'wx'});
      savedImages.push(path);
    }
    await link(temporary, join(directory, filename));
  } catch (error) {
    await Promise.allSettled(savedImages.map(path => rm(path, {force:true})));
    if (error.code === 'EEXIST') throw new SaveError('That slug already exists. Pick a new one.', 409);
    throw error;
  } finally {
    await rm(temporary, {force:true}).catch(console.error);
  }
  return 'content/' + kind + '/' + filename;
}

export async function saveContent(request, response, origin) {
  function reply(status, data) {
    response.writeHead(status, {'Content-Type':'application/json'});
    response.end(JSON.stringify(data));
  }
  if (request.method !== 'POST') return reply(405, {error:'Use POST to save content.'});
  if (request.headers.origin !== origin) return reply(403, {error:'Open the editor from its local address.'});
  try {
    const data = await receive(request);
    reply(201, {path:await store(data)});
  } catch (error) {
    if (!(error instanceof SaveError)) console.error(error);
    reply(error instanceof SaveError ? error.status : 500, {error:error instanceof SaveError ? error.message : 'Could not save content.'});
  }
}