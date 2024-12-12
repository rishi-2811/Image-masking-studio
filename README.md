# Image Masking Studio
A React-based image masking widget that allows users to upload images, draw masks, and export the results.

## Features
- Image upload (JPEG/PNG)
- Interactive canvas drawing with adjustable brush size
- Multiple brush types (Pen, Spray, Circle)
- Custom color palette with color picker
- Mask generation with drawing on black background
- Side-by-side display of original and mask images
- Clear canvas functionality
- Responsive design with gradient backgrounds

## Technologies Used
- React
- Fabric.js for canvas manipulation
- TailwindCSS for styling and responsive design

## Prerequisites
- Node.js 16.0 or higher
- npm or yarn package manager

## Installation
1. Clone the repository:
```bash
git clone https://github.com/rishi-2811/Image-masking-studio.git
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install additional dependencies:
```bash
npm install fabric
# Fabric.js is already in the project, but this ensures latest version
```

4. Start the development server:
```bash
npm run dev
# or
yarn run
```

5. Open your browser and navigate to `http://localhost:5713`

## Usage
1. Click the file input to upload an image
2. Use the slider to adjust brush size
3. Select brush type from dropdown
4. Choose a color from preset palette or use custom color picker
5. Draw on the image to create a mask
6. Click "Generate Mask" to create and display the mask
7. Use "Clear Canvas" to start over
8. Download the generated mask image

## Challenges and Solutions
1. **Canvas Rendering**: 
   - Challenge: Integrating Fabric.js with React's state management
   - Solution: Used `useRef` to maintain stable canvas reference and carefully managed component lifecycle

2. **Image Scaling**: 
   - Challenge: Maintaining proper image aspect ratio while fitting within the canvas
   - Solution: Implemented dynamic scale calculation that preserves image proportions

3. **Brush Customization**:
   - Challenge: Supporting multiple brush types with different drawing behaviors
   - Solution: Created a flexible brush type selection mechanism using Fabric.js's brush classes

## Future Improvements
- Add support for multiple mask layers
- Implement more advanced brush types
- Add image editing capabilities
- Introduce machine learning-based mask refinement
- Add support for saving and loading mask projects

## Known Limitations
- Maximum image upload size is 10MB
- Supports PNG and JPEG formats
- Requires modern browser with JavaScript enabled


## Author
Created with ❤️ by Rishi
