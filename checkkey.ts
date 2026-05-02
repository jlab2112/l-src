import type { LilithClient } from "@/client.js";
import { chatJson } from "./chat.js";
import getUserGiftedRanks from "./getUserGiftedRanks.js";

const checkKeyMessage = [
	"",
	{ text: "Lilith ", color: "red" },
	{ text: "> ", color: "dark_gray" },
	{ text: "Your API Key is invalid! Refer to the ", color: "gray" },
	{
		text: "Lilith documentation",
		color: "red",
		underlined: true,
		clickEvent: {
			action: "open_url",
			value: "https://docs.lilith.rip/guides/setup/apikey#getting-an-api-key",
		},
	},
	{ text: " for instructions.", color: "gray" },
];

export function checkKey(client: LilithClient, key: string, silent: boolean) {
	fetchPunishmentStats(key)
		.then((_) => {
			if (client.rank === "unknown") getUserGiftedRanks(client);
			client.apiKey = { value: key, valid: true };
		})
		.catch((_err) => {
			client.apiKey = { value: key, valid: false };
			Lilith.log.info("Invalid API Key!");
			if (!silent) chatJson(client, checkKeyMessage);
		});
}

async function fetchPunishmentStats(key: string) {
	const response = await fetch("https://api.hypixel.net/v2/punishmentstats", {
		headers: { "API-Key": key },
	});
	if (!response.ok) throw new Error();
}
