// Smoke test for the herdr-core extension. Run with node 24+ (type stripping):
//   npm install --no-save typebox
//   node scripts/smoke.mjs
// It drives the real extension module with a fake ExtensionAPI and checks the
// registered tool and the session_start footer behavior.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

import extension from "../extensions/herdr-core.ts";

const tools = [];
const handlers = new Map();
const fakePi = {
	registerTool: (tool) => tools.push(tool),
	on: (name, handler) => {
		const list = handlers.get(name) ?? [];
		list.push(handler);
		handlers.set(name, list);
	},
};

extension(fakePi);

// Exactly one tool, correctly named, with a discovery surface.
assert.equal(tools.length, 1);
const tool = tools[0];
assert.equal(tool.name, "hc_manual");
assert.match(tool.description, /herdr-core/);
assert.ok(tool.promptSnippet.length > 0);
assert.ok("target" in tool.parameters.properties);

// Default target returns the live hc manual.
const hc = await tool.execute("t1", {});
assert.equal(hc.isError, undefined);
assert.match(hc.content[0].text, /^# hc manual \(herdr-core\)/);
assert.match(hc.content[0].text, /hc wait --children/);

// Explicit hc target behaves the same.
const hcExplicit = await tool.execute("t2", { target: "hc" });
assert.equal(hcExplicit.content[0].text, hc.content[0].text);

// herdr-app target: clean error when the CLI is absent, manual when present.
let hasHerdrApp = true;
try {
	execFileSync("which", ["herdr-app"], { stdio: "ignore" });
} catch {
	hasHerdrApp = false;
}
const app = await tool.execute("t3", { target: "herdr-app" });
if (hasHerdrApp) {
	assert.equal(app.isError, undefined);
	assert.ok(app.content[0].text.length > 0);
} else {
	assert.equal(app.isError, true);
	assert.match(app.content[0].text, /not installed/);
}

// Unknown targets fail cleanly instead of crashing.
const bogus = await tool.execute("t4", { target: "bogus" });
assert.equal(bogus.isError, true);
assert.match(bogus.content[0].text, /unknown manual target/);

// session_start footer: off without HC_TERMINAL_ID, on with it, off without UI.
const startHandlers = handlers.get("session_start");
assert.ok(startHandlers && startHandlers.length === 1);
delete process.env.HC_TERMINAL_ID;

let status = null;
const uiCtx = { hasUI: true, ui: { setStatus: (key, value) => (status = [key, value]) } };
await startHandlers[0]({}, uiCtx);
assert.equal(status, null);

process.env.HC_TERMINAL_ID = "t5p";
status = null;
await startHandlers[0]({}, uiCtx);
assert.deepEqual(status, ["herdr-core", "herdr t5p"]);

status = null;
await startHandlers[0]({}, { hasUI: false, ui: { setStatus: (key, value) => (status = [key, value]) } });
assert.equal(status, null);

console.log("smoke: all checks passed");
