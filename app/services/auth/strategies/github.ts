import { redirect } from "react-router";
import { githubSignin, verifyGithub } from "~/api/endpoint/.server/auth";
import {
	commitMessageSession,
	getMessageSession,
} from "~/services/sessions/message.server";
import { GithubStrategy } from "../strategy";

export const githubStrategy = new GithubStrategy({
	async verify({ request }) {
		const messageSession = await getMessageSession(
			request.headers.get("Cookie"),
		);

		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");

		if (!code || !state) {
			messageSession.flash("toast", {
				title: "Error!",
				message: "Something went wrong!",
				type: "error",
			});

			return redirect("/login", {
				headers: {
					"Set-Cookie": await commitMessageSession(messageSession),
				},
			});
		}

		const res = await verifyGithub({ params: { code, state } });
		console.log(await res.json());

		return redirect("/");
	},
	async authorize() {
		try {
			const res = await githubSignin();
			const data = await res.json();

			return data?.redirect;
		} catch (error) {
			console.error("error", error);
			return "/";
		}
	},
});
