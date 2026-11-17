import { execFile } from "node:child_process";
import { Type } from "typebox";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// The manual is what changes between hc versions, so every call re-runs the
// local CLI instead of caching a copy that can go stale.
const MANUALS = {
	hc: { cli: "hc", args: ["--skill"] },
	"herdr-app": { cli: "herdr-app", args: ["--skill"] },
} as const;

type ManualTarget = keyof typeof MANUALS;

type ManualResult = { ok: true; text: string } | { ok: false; error: string };

function fetchManual(target: ManualTarget): Promise<ManualResult> {
	const { cli, args } = MANUALS[target];
	return new Promise((resolve) => {
		execFile(cli, args, { timeout: 10_000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
			if (err) {
				if (err.code === "ENOENT") {
					resolve({ ok: false, error: `${cli} is not installed or not on PATH, so the ${cli} manual is unavailable.` });
					return;
				}
				const exitCode = typeof err.code === "number" ? ` (exit ${err.code})` : "";
				resolve({ ok: false, error: `${cli} ${args.join(" ")} failed${exitCode}: ${(stderr || err.message).trim()}` });
				return;
			}
			resolve({ ok: true, text: stdout.trim() });
		});
	});
}

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "hc_manual",
		label: "hc manual",
		description:
			"Return the current herdr-core manual verbatim from the local CLI. target hc runs `hc --skill`; target herdr-app runs `herdr-app --skill` (window, spaces, tabs, layouts, mods). Use it for details the herdr-core skill omits: remote machines, recovery, config keys, exit codes, window work.",
		promptSnippet: "Fetch the live herdr-core (hc) or herdr-app manual from the local CLI",
		promptGuidelines: [
			"Use hc_manual when you need herdr-core details the herdr-core skill omits; it returns the live manual, so prefer it over any copied or remembered text.",
		],
		parameters: Type.Object({
			target: Type.Optional(
				Type.Union([Type.Literal("hc"), Type.Literal("herdr-app")], {
					description: "Which manual to fetch. Default: hc",
				}),
			),
		}),
		async execute(_toolCallId, params) {
			const target = params.target ?? "hc";
			if (!MANUALS[target]) {
				return { content: [{ type: "text", text: `unknown manual target: ${String(target)}` }], isError: true };
			}
			const result = await fetchManual(target);
			if (!result.ok) {
				return { content: [{ type: "text", text: result.error }], isError: true };
			}
			return { content: [{ type: "text", text: result.text }] };
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		const terminalId = process.env.HC_TERMINAL_ID;
		if (terminalId && ctx.hasUI) {
			ctx.ui.setStatus("herdr-core", `herdr ${terminalId}`);
		}
	});
}
