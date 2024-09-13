function generateEhhCode(shapes, outputFilePath) {
    const backgroundColor = shapes.backgroundColor || '#000000'; 

    
    const bgRgb = hexToRgb(backgroundColor);
    const backgroundColorStr = `${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}`;

    
    let shapeDefinitions = [];
    let previousShapes = {}; 
    let shapeIndex = 0;

    shapes.forEach((shape) => {
        const { type, startX, startY, endX, endY, color, points } = shape;

      
        const rgb = hexToRgb(color);
        const colorStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

        const radius = Math.round(Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

       
        const shapeName = `${type}${shapeIndex}`;

        
        let shapeCode = '';
        if (type === 'circle') {
            if (previousShapes[type]) {
              
                shapeCode = `${previousShapes[type]} :: ${shapeName} { position: ${startX}, ${startY}; radius: ${radius}; color: ${colorStr} }`;
            } else {
                
                shapeCode = `circle :: ${shapeName} { position: ${startX}, ${startY}; radius: ${radius}; color: ${colorStr} }`;
            }
        } else if (type === 'rect') {
            if (previousShapes[type]) {
               
                shapeCode = `${previousShapes[type]} :: ${shapeName} { position: ${startX}, ${startY}; width: ${width}; height: ${height}; color: ${colorStr} }`;
            } else {
               
                shapeCode = `rect :: ${shapeName} { position: ${startX}, ${startY}; width: ${width}; height: ${height}; color: ${colorStr} }`;
            }
        } else if (type === 'polyline' && points.length > 1) {
            const positions = points.map((point, index) => `position [${index}]: ${point.x}, ${point.y}`).join('\n    ');

            if (previousShapes[type]) {
               
                shapeCode = `${previousShapes[type]} :: ${shapeName} {\n    ${positions}\n}`;
            } else {
               
                shapeCode = `polyLines :: ${shapeName} {\n    color: ${colorStr}\n    thickness: 4\n    ${positions}\n}`;
            }
        }

        shapeDefinitions.push(shapeCode);

        previousShapes[type] = shapeName;
        shapeIndex++;
    });

    return `
ehh {
    width: 800
    height: 600
    background: ${backgroundColorStr}
    output: "${outputFilePath.replace(/\\/g, '/')}"
}

${shapeDefinitions.join('\n')}
`;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

module.exports = generateEhhCode;
