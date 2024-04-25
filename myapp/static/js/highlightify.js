document.addEventListener("DOMContentLoaded", () => {
    const PDFJSLib = window.pdfjsLib;
    document.getElementById('upload-button').addEventListener('click', handleUploadButtonClick);
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.min.js';

    let pdfContainer;
    let highlightData = []; // Array to store highlight data

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
            const reader = new FileReader();
            reader.onload = function (event) {
                const typedarray = new Uint8Array(event.target.result);
                displayPDF(typedarray);
            };
            reader.readAsArrayBuffer(file);
        } else {
            console.error('No file selected');
        }
    }

    function displayPDF(pdfData) {
        pdfjsLib.getDocument(pdfData).promise.then(pdf => {
            pdfContainer = document.createElement('div');
            pdfContainer.setAttribute('id', 'pdf-container');

            // Loop through each page number
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(page => {
                    const pageDiv = document.createElement('div');
                    pageDiv.classList.add('page');
                    
                    const textLayer = document.createElement('div');
                    textLayer.classList.add('text-layer');
                    textLayer.style.position = 'absolute';
                    textLayer.style.top = 0;
                    textLayer.style.left = 0;
                    textLayer.style.width = '100%';
                    textLayer.style.height = '100%';
                    pageDiv.appendChild(textLayer);

                    const viewport = page.getViewport({ scale: 1 });
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const context = canvas.getContext('2d');
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    page.render(renderContext).promise.then(() => {
                        page.getTextContent().then(textContent => {
                            console.log('Text Content:', textContent);
                            console.log(textContent);
                            for (let i = 0; i < textContent.items.length; i++) {
                                console.log(textContent.items[i].str);
                            }
                            const textLayerDiv = document.createElement('div');
                            textLayerDiv.classList.add('text-layer');
                            textLayer.appendChild(textLayerDiv);
                            console.log("GI");
                            PDFJSLib.renderTextLayer({
                                textContent: textContent,  // Existing parameter
                                container: textLayerDiv,
                                viewport: viewport,
                                textDivs: [],
                                textContentSource: page  // New parameter (specifies the page object)
                            });
                            console.log("GI");
                        });
                    });

                    // Add event listener to capture text selection on the text layer
                    textLayer.addEventListener('mouseup', event => {
                        const rect = textLayer.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;
                        const selectedText = getSelectedText(textLayer, mouseX, mouseY);
                        if (selectedText) {
                            console.log('Selected Text:', selectedText);
                            // Implement highlighting functionality here using the selectedText and its position within the textLayerDiv
                            highlightData.push({ page: pageNum, text: selectedText });
                            console.log('Highlight data:', highlightData);
                            // You can send the highlight data to the server here
                        }
                    });

                    // Append canvas to PDF container
                    pageDiv.appendChild(canvas);
                    pdfContainer.appendChild(pageDiv);
                });
            }

            // Clear the main section and append the PDF container (after all pages are processed)
            const mainSection = document.querySelector('main');
            mainSection.innerHTML = '';
            mainSection.appendChild(pdfContainer);
        });
    }

    // Function to get the selected text from the text layer
    function getSelectedText(textLayer, mouseX, mouseY) {
        const textDivs = textLayer.querySelectorAll('.textLayer div');

        for (let i = 0; i < textDivs.length; i++) {
            const textDiv = textDivs[i];
            const rect = textDiv.getBoundingClientRect();
            if (mouseX >= rect.left && mouseX <= rect.right &&
                mouseY >= rect.top && mouseY <= rect.bottom) {
                return textDiv.textContent.trim();
            }
        }
        return null; // No text found at the selected coordinates
    }
});
