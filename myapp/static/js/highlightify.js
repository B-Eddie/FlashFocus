document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById('upload-button').addEventListener('click', handleUploadButtonClick);
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.min.js';

    function handleUploadButtonClick() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf';
        fileInput.addEventListener('change', handleFileUpload);
        fileInput.click(); // Simulate a click on the file input element
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Create a progress bar
            const progressBar = document.createElement('progress');
            progressBar.value = 0;
            progressBar.max = 100;

            // Add the progress bar to the main section
            const mainSection = document.querySelector('main');
            mainSection.appendChild(progressBar);

            // Create a button for displaying the PDF
            const highlightifyButton = document.createElement('button');
            highlightifyButton.textContent = 'Highlightify';
            highlightifyButton.disabled = true; // Disable the button initially

            // Add the highlightify button to the main section
            mainSection.appendChild(highlightifyButton);

            // Upload the file
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload');
            xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    progressBar.value = percentComplete;
                    if (percentComplete === 100) {
                        highlightifyButton.disabled = false; // Enable the button after upload
                    }
                }
            };
            xhr.onload = function () {
                if (xhr.status === 200) {
                    console.log('File uploaded successfully');
                } else {
                    console.error('File upload failed');
                }
            };
            const formData = new FormData();
            formData.append('file', file);
            xhr.send(formData);

            // Add event listener to display PDF when the button is clicked
            highlightifyButton.addEventListener('click', () => {
                displayPDF(file);
                // Remove the progress bar and highlightify button
                progressBar.remove();
                highlightifyButton.remove();
            });
        } else {
            console.error('No file selected');
        }
    }

    function displayPDF(file) {
        if (!file) {
            console.error('No file selected for display');
            return;  // Exit the function if no file
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                const container = document.createElement('div');
                container.setAttribute('id', 'pdf-container');;

                // Loop through each page number
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pdf.getPage(pageNum).then(page => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        const viewport = page.getViewport({ scale: 1 });
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        // Render the page
                        page.render({ canvasContext: context, viewport: viewport });

                        // Add styling for vertical stacking
                        canvas.style.display = 'block'; // Set display to block for stacking
                        canvas.style.marginBottom = '10px'; // Add margin for spacing (optional)

                        container.appendChild(canvas);
                    });
                }

                // Clear the main section and append the PDF container (after all pages are processed)
                const mainSection = document.querySelector('main');
                mainSection.innerHTML = '';
                mainSection.appendChild(container);

                let startX, startY;

                function handleMouseDown(event) {
                    startX = event.offsetX;
                    startY = event.offsetY;
                }

                function createHighlightElement(rect) {
                    const highlightElement = document.createElement('div');
                    highlightElement.style.position = 'absolute';
                    highlightElement.style.top = rect.top + 'px';
                    highlightElement.style.left = rect.left + 'px';
                    highlightElement.style.width = rect.width + 'px';
                    highlightElement.style.height = rect.height + 'px';
                    highlightElement.style.backgroundColor = '#FFFF00'; // Highlight color
                  
                    // Append the highlight element to the container
                    canvas.parentNode.appendChild(highlightElement);
                  }
                  

                function handleMouseUp(event) {
                    const endX = event.offsetX;
                    const endY = event.offsetY;
                  
                    const selectionRect = {
                      x: Math.min(startX, endX),
                      y: Math.min(startY, endY),
                      width: Math.abs(startX - endX),
                      height: Math.abs(startY - endY),
                    };
                  
                    createHighlightElement(selectionRect);
                  }
                  
                  
                const canvas = document.getElementById('pdf-container');
                canvas.addEventListener('mousedown', handleMouseDown);
                canvas.addEventListener('mouseup', handleMouseUp);
            });
        };
        reader.readAsArrayBuffer(file);
    }


    console.log("OMG IT WORKS1");
    //highlights
    (function () {
        const pdfjsLib = window.pdfjsLib;
        const pdfDocument = null;
        const highlightData = [];

        function renderPDFWithHighlighting(file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const typedarray = new Uint8Array(event.target.result);
                pdfjsLib.getDocument(typedarray).promise.then(doc => {
                    pdfDocument = doc;
                    const canvas = document.getElementById('pdf-container');
                    console.log("OMG IT WORKS");
                    const context = canvas.getContext('2d');

                    const renderPage = (pageNum) => {
                        pdfDocument.getPage(pageNum).then(page => {
                            const viewport = page.getViewport({ scale: 1 });
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            page.render({ canvasContext: context, viewport: viewport });
                        });
                    };

                    for (let i = 1; i <= doc.numPages; i++) {
                        renderPage(i);
                    }

                    // Assuming you have a pdfViewer instance from your viewer component
                    if (pdfViewer) {
                        pdfViewer.update(); // Update annotations on the viewer
                    } else {
                        console.warn('pdfViewer instance not found. Annotations might not be reflected.');
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        }

        // Function to handle user interaction and create highlight annotations
        // const canvas = document.getElementById('pdf-container');

        // canvas.addEventListener('mousedown', handleMouseDown);
        // canvas.addEventListener('mouseup', handleMouseUp);



        // function createHighlightAnnotation(rect) {
        //     const annotation = new PDFAJS.Annotation({
        //         subtype: 'Highlight',
        //         rect: rect,
        //         color: '#FFFF00',
        //     });

        //     pdfDocument.addAnnotation(annotation);
        //     pdfDocument.annotationStorage.add(annotation); // Might be required depending on library version
        //     console.log(annotation);
        //     // Update the rendered annotations on the canvas (specific to pdfjsLib.Annotation usage)
        //     pdfViewer.update(); // Assuming you have a pdfViewer instance (if using a viewer component)

        //     // Add the highlighted text to the highlightData array (optional)
        //     const highlightedText = getHighlightedText(rect);
        //     highlightData.push(highlightedText);
        // }

        // Function to extract highlighted text from the PDF content (implementation needed)
        function getHighlightedText(rect) {
            const page = pdfDocument.getPage(rect.pageNumber); // Assuming pageNumber is available from selection

            return page.getTextContent({
                normalizeWhitespace: true, // Optional: normalize whitespace characters
                rect: rect, // Specify the selection rectangle
            }).promise.then(textContent => {
                const textItems = textContent.items;
                let highlightedText = '';
                for (const item of textItems) {
                    if (item) {
                        const { str, transform } = item;
                    } else {
                        // Handle the case where item is undefined
                        console.log('uh oh');
                    }

                    const tx = transform[4]; // Get x-translation for positioning
                    const ty = transform[5]; // Get y-translation for positioning

                    // Check if the text item falls within the selection rectangle based on its position and size
                    if (tx >= rect.x && tx + item.width <= rect.x + rect.width &&
                        ty >= rect.y && ty + item.height <= rect.y + rect.height) {
                        highlightedText += str;
                    }
                }
                return highlightedText;
            });
        }


        // Function to export highlighted text data
        const exportButton = document.getElementById('export-highlights');

        exportButton.addEventListener('click', exportHighlights);

        function exportHighlights() {
            // Convert the highlight data (array) to JSON
            const jsonData = JSON.stringify(highlightData);

            // Create a downloadable blob object with the JSON data
            const blob = new Blob([jsonData], { type: 'application/json' });

            // Create a downloadable link element dynamically
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'highlights.json'; // Set the download filename
            link.click();

            // Revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(link.href);
        }
    })(window.pdfjsLib);
});