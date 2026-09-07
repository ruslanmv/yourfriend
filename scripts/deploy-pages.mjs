import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dist = resolve(root, 'dist');
const temp = await mkdtemp(join(tmpdir(), 'yourfriend-pages-'));

function git(args, cwd = root) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `git ${args.join(' ')} failed`);
  }

  return result.stdout.trim();
}

try {
  await cp(resolve(dist, 'index.html'), resolve(dist, '404.html'));
  await writeFile(resolve(dist, '.nojekyll'), '');

  const remote = git(['config', '--get', 'remote.origin.url']);
  await cp(dist, temp, { recursive: true });

  git(['init'], temp);
  git(['checkout', '-b', 'gh-pages'], temp);
  git(['config', 'user.name', 'github-pages'], temp);
  git(['config', 'user.email', 'github-pages@users.noreply.github.com'], temp);
  git(['add', '--all'], temp);
  git(['commit', '-m', 'Deploy GitHub Pages'], temp);
  git(['remote', 'add', 'origin', remote], temp);
  git(['push', '--force', 'origin', 'gh-pages'], temp);

  console.log('Published dist/ to the gh-pages branch.');
} finally {
  await rm(temp, { recursive: true, force: true });
}
