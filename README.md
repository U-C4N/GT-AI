# AI Assistant

AI Assistant is a powerful web application that combines language translation and text completion capabilities using advanced AI models from Groq.

## Features

- **Translation**: Translate text from any language to English.
- **Text Completion**: Get AI-powered suggestions for completing your text.
- **Language Detection**: Automatically detect the language of the input text.
- **Multiple AI Models**: Choose from various Groq models for different tasks.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Groq API

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Groq API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-assistant.git
   cd ai-assistant
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Install required React libraries and components:
   ```
   npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority lucide-react
   # or
   yarn add @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority lucide-react
   ```

4. Create a `.env.local` file in the root directory and add your Groq API key:
   ```
   NEXT_PUBLIC_GROQ_API_KEY=your_api_key_here
   ```

5. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select the desired AI model from the dropdown menu.
2. Choose between "Translate" and "Complete" modes.
3. Enter your text in the input area.
4. For translation: The translated text will appear below.
5. For completion: Click on suggested words or press Tab to autocomplete.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Groq](https://groq.com/) for providing the AI models and API.
- [Vercel](https://vercel.com/) for Next.js and hosting solutions.
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework.
- [Radix UI](https://www.radix-ui.com/) for accessible React components.

## Author

<p align="left">
<b>Umutcan Edizaslan:</b>
<a href="https://github.com/U-C4N" target="blank"><img align="center" src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Github-Dark.svg" alt="TutTrue" height="30" width="40" /></a>
<a href="https://x.com/UEdizaslan" target="blank"><img align="center" src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Twitter.svg" height="30" width="40" /></a>
</p>
