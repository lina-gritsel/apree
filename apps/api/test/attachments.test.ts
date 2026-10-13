import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { MAX_FILE_SIZE, parseAttachments } from '../src/tasks/attachments';

test('attachments decode strict base64 and enforce file size and safe names', () => {
  const file = {
    name: 'notes.txt',
    contentType: 'text/plain',
    dataBase64: Buffer.from('hello').toString('base64'),
  };
  const parsed = parseAttachments([file], false);
  assert.equal(parsed.uploads[0].size, 5);
  assert.equal(Buffer.from(parsed.uploads[0].data).toString(), 'hello');
  for (const dataBase64 of [
    'a===',
    'YWJj!',
    'YQ',
    Buffer.alloc(MAX_FILE_SIZE + 1).toString('base64'),
  ]) {
    assert.throws(() => parseAttachments([{ ...file, dataBase64 }], false));
  }
  for (const name of ['../file', 'folder\\file', 'bad\nname', ' ']) {
    assert.throws(() => parseAttachments([{ ...file, name }], false));
  }
  assert.throws(() => parseAttachments([{ id: randomUUID() }], false));
  assert.throws(() => parseAttachments([{ ...file, id: randomUUID() }], true));
  assert.throws(() => parseAttachments([{}], true));
});
