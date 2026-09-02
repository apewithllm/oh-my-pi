import { afterEach, describe, expect, it } from "bun:test";
import { getEnvApiKey } from "@oh-my-pi/pi-ai/env-api-key";
import { getProviderDefinition } from "@oh-my-pi/pi-ai/registry";

const loginOpenllm = getProviderDefinition("openllm")?.login;
if (!loginOpenllm) throw new Error("OpenLLM login is not registered");

describe("OpenLLM login", () => {
	const originalKey = Bun.env.OPENLLM_API_KEY;
	afterEach(() => {
		if (originalKey === undefined) delete Bun.env.OPENLLM_API_KEY;
		else Bun.env.OPENLLM_API_KEY = originalKey;
	});

	it("stores the local placeholder when the key is left empty", async () => {
		let authInstructions: string | undefined;
		const apiKey = await loginOpenllm({
			onAuth: info => {
				authInstructions = info.instructions;
			},
			onPrompt: async () => "",
		});

		expect(apiKey).toBe("openllm-local");
		expect(authInstructions).toContain("curl -fsSL https://www.openllm.sh/install | bash");
		expect(authInstructions).toContain("http://127.0.0.1:8787/v1");
		expect(authInstructions).toContain("OPENLLM_BASE_URL");
	});

	it("keeps a pasted key", async () => {
		const apiKey = await loginOpenllm({ onPrompt: async () => " sk-openllm-test " });
		expect(apiKey).toBe("sk-openllm-test");
	});

	it("reads OPENLLM_API_KEY from the environment", () => {
		Bun.env.OPENLLM_API_KEY = "openllm-env";
		expect(getEnvApiKey("openllm")).toBe("openllm-env");
	});
});
