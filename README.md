# py.ai Clone with Claude 3-7 Sonnet

A clone of py.ai using Next.js and Anthropic's Claude 3-7 Sonnet model.

## Features

- Real-time streaming responses
- Markdown and code syntax highlighting
- Claude's reasoning capabilities
- Clean, modern interface

## Prerequisites

- Node.js 18+ and npm
- An Anthropic API key for Claude 3-7 Sonnet

## Getting Started

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.local.example` file to `.env.local` and add your Anthropic API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` to add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [AI SDK](https://github.com/vercel/ai) - SDK for building AI-powered applications
- [Claude 3-7 Sonnet](https://www.anthropic.com/claude) - Anthropic's advanced AI model

## Project Structure

- `app/page.tsx` - Home page
- `app/chat/page.tsx` - Chat interface
- `app/api/chat/route.ts` - API route for Claude 3-7 Sonnet
- `app/layout.tsx` - Root layout component

## License

This project is open source and available under the [MIT License](LICENSE).
