# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Environment variables

Set the frontend's backend host in a `.env` file at the project root. Example (no trailing `/api`):

```
VITE_API_URL=https://blog-backend-e4j1.onrender.com
```

Copy `.env.example` to `.env` and edit as needed for your environment.

## Render pnpm / debug notes

- The Render manifest (`render.yaml`) uses `pnpm` for faster installs in production. The Render `installCommand` runs:

	```bash
	corepack enable && pnpm install --frozen-lockfile --prefer-offline --silent
	```

- The `buildCommand` is configured to print helpful debug info (pnpm version and a small `node_modules` summary) before running the production build. This helps diagnose slow installs or missing files on Render.

- Locally you can reproduce the Render build behaviour with:

	```bash
	pnpm install --frozen-lockfile
	pnpm run build:debug
	```

If you prefer npm, Render will still work — we switched to `pnpm` to reduce install times. If you'd rather revert to npm, let me know and I can update `render.yaml` accordingly.

## Vercel deployment notes

- A `vercel.json` has been added to configure Vercel to build this project as a static site using the `dist` folder as the publish output.

- Recommended Vercel Project Settings:
	- **Install Command**: corepack enable && pnpm install --frozen-lockfile --prefer-offline --silent
	- **Build Command**: pnpm run build
	- **Output Directory**: dist

- If you prefer to use npm on Vercel, set the install command to `npm ci` and build to `npm run build` in the Vercel project settings.

- To deploy locally using the Vercel CLI:

	```bash
	# install/vercel CLI: see https://vercel.com/docs/cli
	vercel login
	vercel --prod
	```

### Troubleshooting "No Token Provided"

If you encounter a "no token provided" error when running Vercel CLI commands, it means you are not authenticated or the CLI cannot find your access token.

1. **Login**: Run `vercel login` to authenticate.
2. **Environment Variable**: If you are in a CI/CD environment, ensure the `VERCEL_TOKEN` environment variable is set.
3. **Project Link**: Ensure your project is linked by running `vercel link`.

