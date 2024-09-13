const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const submitButton = document.getElementById('submitDrawing');
const shapeSelector = document.getElementById('shapeSelector');
const colorPicker = document.getElementById('colorPicker');
const bgColorPicker = document.getElementById('bgColorPicker');
//const eraserButton = document.getElementById('eraserButton');
const clearCanvasButton = document.getElementById('clearCanvasButton');
const loadingBar = document.getElementById('loadingBar');
const errorPanel = document.getElementById('errorPanel');
const outputPopup = document.getElementById('outputPopup');
const closePopup = document.getElementById('closePopup');

let drawing = false;
let currentShape = 'circle'; 
let currentColor = '#ffffff'; 
let isErasing = false; 
let shapes = []; 
let polylinePoints = []; 


canvas.style.backgroundColor = bgColorPicker.value;


shapeSelector.addEventListener('change', (e) => {
    currentShape = e.target.value;
    if (currentShape !== 'polyline') {
        polylinePoints = []; // Clear polyline points when switching away from polyline
    }
});

// Update current color based on user selection
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    isErasing = false; 
});

// Update background color
bgColorPicker.addEventListener('input', (e) => {
    canvas.style.backgroundColor = e.target.value;
});


clearCanvasButton.addEventListener('click', () => {
    shapes = []; 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
});


canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const startX = e.offsetX;
    const startY = e.offsetY;

    if (currentShape === 'polyline') {
        polylinePoints.push({ x: startX, y: startY });
        if (polylinePoints.length > 1) {
            shapes.push({
                type: currentShape,
                color: currentColor,
                points: [...polylinePoints]
            });
            drawShape(shapes[shapes.length - 1]);
        }
    } else {
        const shape = {
            type: currentShape,
            color: isErasing ? '#000000' : currentColor,
            startX,
            startY,
            endX: startX,
            endY: startY
        };
        shapes.push(shape);
    }
});


canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    if (currentShape !== 'polyline') {
        const shape = shapes[shapes.length - 1];
        shape.endX = e.offsetX;
        shape.endY = e.offsetY;

        // Redraw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(drawShape);
    }
});


canvas.addEventListener('mouseup', () => {
    drawing = false;
});


function drawShape(shape) {
    const { startX, startY, endX, endY, color, type, points } = shape;
    const width = endX - startX;
    const height = endY - startY;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isErasing ? 10 : 2;

    if (type === 'circle') {
        const radius = Math.sqrt(width * width + height * height) / 2;
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (type === 'rect') {
        ctx.strokeRect(startX, startY, width, height);
    } else if (type === 'polyline' && points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }
}


submitButton.addEventListener('click', async () => {
    try {
       
        outputImage.src = '';
        outputImage.classList.remove('active');
        errorPanel.classList.remove('active');
        errorPanel.textContent = '';

       
        loadingBar.style.display = 'block';
        loadingBar.classList.add('active');
        const backgroundColor = bgColorPicker.value;
      
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shapes, backgroundColor })
        });

        if (!response.ok) {
            throw new Error('Error generating image. Please try again.');
        }

        loadingBar.style.display = 'none';
        loadingBar.classList.remove('active');

        
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);

        
        openPopup(imgUrl);
        outputImage.onload = () => {
            outputImage.classList.add('active');
        };
    } catch (error) {
        
        loadingBar.style.display = 'none';
        loadingBar.classList.remove('active');
        errorPanel.textContent = error.message;
        errorPanel.classList.add('active');
    }
});

closePopup.addEventListener('click', () => {
    overlay.style.display = 'none';
    outputPopup.style.display = 'none';
    outputImage.classList.remove('active');
});

function openPopup(imageSrc) {
    overlay.style.display = 'block';
    outputPopup.style.display = 'block';
    outputImage.src = imageSrc;
    outputImage.onload = () => {
        outputImage.classList.add('active');
    };
}