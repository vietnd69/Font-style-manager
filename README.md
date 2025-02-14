# Font Style Manager for Figma

A powerful Figma widget to manage and bulk edit text styles with support for variables.

## Features

- 🎨 **Bulk Edit Text Styles**
  - Edit multiple text styles simultaneously
  - Update font family, style, size, line height, and letter spacing
  - Modify style descriptions and grouping

- 📦 **Variable Support**
  - Bind text properties to Figma variables
  - Support for font style, weight, size, and other properties
  - Filter variables by appropriate scopes (FONT_STYLE, FONT_WEIGHT, etc.)

- 🔍 **Advanced Search & Filter**
  - Search by style name, group, or properties
  - Filter styles by font family, weight, size
  - Quick access to frequently used styles

- 📱 **Modern UI**
  - Clean and intuitive interface
  - Real-time preview of changes
  - Responsive design for different screen sizes

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Font-style-manager.git
cd Font-style-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start development:
```bash
npm run dev
```

## Usage

### Edit Mode

1. Click "Load local text styles" to import your Figma text styles
2. Use the search bar to filter styles
3. Select styles you want to edit using checkboxes
4. Make changes to properties in bulk
5. Click "Update styles" to apply changes

### Variable Binding

1. Click the variable icon next to any property
2. Choose a variable from the list
3. Variables are filtered by appropriate scope (e.g., FONT_STYLE for font styles)

### View Mode

1. Switch to view mode using the toggle button
2. Browse styles in a clean, organized list
3. Group styles for better organization
4. Quick copy style properties

## Development

- Build production version:
```bash
npm run build:production
```

- Format code:
```bash
npm run format
```

- Type checking:
```bash
npm run tsc
```

## Tech Stack

- React
- TypeScript
- Figma Widget API
- Ant Design
- Vite

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by vietnd
