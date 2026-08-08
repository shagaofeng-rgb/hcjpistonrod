import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeArticleHtml } from "../src/lib/content-html";

test("removes unsafe blocks and their visible source text", () => {
  const output = sanitizeArticleHtml('<p>Reliable inspection.</p><script>window.secret = "do-not-show";</script><pre><code>const token = "hidden";</code></pre>');

  assert.equal(output, "<p>Reliable inspection.</p>");
  assert.doesNotMatch(output, /secret|token|script|code/i);
});

test("renders safe Markdown links and emphasis while blocking unsafe protocols", () => {
  const output = sanitizeArticleHtml('<p>[Honed Tube](/products/honed-tube) **Fixed requirement** <a href="javascript:alert(1)">Unsafe</a></p>');

  assert.match(output, /<a href="\/products\/honed-tube" rel="nofollow noopener">Honed Tube<\/a>/);
  assert.match(output, /<strong>Fixed requirement<\/strong>/);
  assert.doesNotMatch(output, /javascript:/i);
});

test("keeps simple technical tables without inline attributes", () => {
  const output = sanitizeArticleHtml('<table class="raw"><tr><th onclick="bad()">Diameter</th><td>f7</td></tr></table>');

  assert.equal(output, "<table><tr><th>Diameter</th><td>f7</td></tr></table>");
});
