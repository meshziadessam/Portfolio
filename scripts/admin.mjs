import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import next from 'next';
import { importWord } from './import-word.mjs';
import { contentLibrary } from './content-library.mjs';
import { saveContent } from './save-content.mjs';

const password = process.env.PORTFOLIO_ADMIN_PASSWORD;
if (!password || password.length < 10) {
  throw new Error('Set PORTFOLIO_ADMIN_PASSWORD to at least 10 characters.');
}

process.env.PORTFOLIO_LOCAL_ADMIN = '1';
const hostname = '127.0.0.1';
const port = 3001;
const app = next({dev: true, hostname, port});
const handle = app.getRequestHandler();
const expected = Buffer.from('Basic ' + Buffer.from('admin:' + password).toString('base64'));

await app.prepare();
createServer((request, response) => {
  const actual = Buffer.from(request.headers.authorization || '');
  response.setHeader('Cache-Control', 'no-store');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    response.writeHead(401, {'WWW-Authenticate': 'Basic realm="Portfolio editor"'});
    response.end('Authentication required.');
    return;
  }
  if (request.url === '/_admin/import-word') {
    void importWord(request, response, 'http://' + hostname + ':' + port);
    return;
  }
  if (request.url === '/_admin/content') {
    void contentLibrary(request, response);
    return;
  }
  if (request.url === '/_admin/save') {
    void saveContent(request, response, 'http://' + hostname + ':' + port);
    return;
  }
  void handle(request, response);
}).listen(port, hostname, () => console.log('Editor: http://127.0.0.1:3001/add/'));
