// Unit tests for markdownToADF
function markdownToADF(md) {
  if (!md || !md.trim()) return { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [] }] };
  const lines = md.split('\n');
  const content = [];
  let listItems = [];

  function flushList() {
    if (!listItems.length) return;
    content.push({
      type: 'bulletList',
      content: listItems.map(text => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      })),
    });
    listItems = [];
  }

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const li = line.match(/^-\s+(?:\[[ x]\]\s+)?(.+)/);

    if (h3) {
      flushList();
      content.push({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: h3[1] }] });
    } else if (h2) {
      flushList();
      content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: h2[1] }] });
    } else if (li) {
      listItems.push(li[1]);
    } else if (!line.trim()) {
      flushList();
    } else {
      flushList();
      content.push({ type: 'paragraph', content: [{ type: 'text', text: line }] });
    }
  }
  flushList();
  if (!content.length) content.push({ type: 'paragraph', content: [] });
  return { type: 'doc', version: 1, content };
}

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log('  PASS ', msg); passed++; }
  else { console.log('  FAIL ', msg); failed++; }
}

const empty = markdownToADF('');
assert(empty.type === 'doc', 'empty: returns doc');
assert(empty.content[0].type === 'paragraph', 'empty: has paragraph');

const heading = markdownToADF('## Problem');
assert(heading.content[0].type === 'heading', 'h2: node type');
assert(heading.content[0].attrs.level === 2, 'h2: level 2');
assert(heading.content[0].content[0].text === 'Problem', 'h2: text');

const h3 = markdownToADF('### Sub');
assert(h3.content[0].attrs.level === 3, 'h3: level 3');

const list = markdownToADF('- item one\n- item two');
assert(list.content[0].type === 'bulletList', 'list: bulletList node');
assert(list.content[0].content.length === 2, 'list: two items');
assert(list.content[0].content[0].content[0].content[0].text === 'item one', 'list: first item text');

const checkbox = markdownToADF('- [ ] do this');
assert(checkbox.content[0].content[0].content[0].content[0].text === 'do this', 'checkbox: strips checkbox syntax');

const checked = markdownToADF('- [x] done');
assert(checked.content[0].content[0].content[0].content[0].text === 'done', 'checked: strips checked syntax');

const mixed = markdownToADF('## Title\n\n- item\n\nSome text');
assert(mixed.content[0].type === 'heading', 'mixed: heading first');
assert(mixed.content[1].type === 'bulletList', 'mixed: list second');
assert(mixed.content[2].type === 'paragraph', 'mixed: paragraph third');

console.log(`\n${passed}/${passed + failed} tests passed`);
process.exit(failed > 0 ? 1 : 0);
