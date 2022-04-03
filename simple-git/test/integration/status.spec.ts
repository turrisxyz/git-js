import { filesAdded, initRepo } from '@simple-git/test-utils';
import { createTestContext, like, newSimpleGit, SimpleGitTestContext } from '../__fixtures__';

describe('status', () => {
   let context: SimpleGitTestContext;

   beforeEach(async () => context = await createTestContext());
   beforeEach(async () => {
      await initRepo(context);
      await context.file(['clean-dir', 'clean']);
      await context.file(['dirty-dir', 'dirty']);
      await filesAdded(context, ['alpha', 'beta'], ['alpha', 'beta', './clean-dir']);
   });

   it('whole repo status', async () => {
      const status = await newSimpleGit(context.root).status();
      expect(status).toHaveProperty('not_added', ['dirty-dir/dirty']);
   });

   it('clean pathspec in options array', async () => {
      const status = await newSimpleGit(context.root).status(['--', 'clean-dir']);
      expect(status.isClean()).toBe(true);
      expect(status.files).toEqual([]);
   });

   it('dirty pathspec in options array', async () => {
      const status = await newSimpleGit(context.root).status(['--', 'dirty-dir']);
      expect(status.isClean()).toBe(false);
      expect(status.not_added).toEqual(['dirty-dir/dirty']);
   });

   it('clean pathspec in options object', async () => {
      const status = await newSimpleGit(context.root).status({'--': null, 'clean-dir': null});
      expect(status.isClean()).toBe(true);
   });

   it('dirty pathspec in options object', async () => {
      const status = await newSimpleGit(context.root).status({'--': null, 'dirty-dir': null});
      expect(status.isClean()).toBe(false);
      expect(status.not_added).toEqual(['dirty-dir/dirty']);
   });

   it('detached head', async () => {
      const git = newSimpleGit(context.root);
      expect(await git.status()).toEqual(like({
         detached: false,
         current: expect.any(String),
      }));

      await git.raw('tag', 'v1');
      await git.raw('checkout', 'v1');

      expect(await git.status()).toEqual(like({
         current: 'HEAD',
         detached: true,
      }))
   })

});
