document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('upload-button').addEventListener('click', handleUploadButtonClick);
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.min.js';

    let pdfContainer;
    console.log("SIEFJ");
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
                    page.getTextContent().then(textContent => {
                        const pageDiv = document.createElement('div');
                        pageDiv.classList.add('page');
    
                        // Group text items by y-coordinate to simulate text lines
                        const lines = groupTextItemsByY(textContent.items);
                        lines.reverse();
    
                        // Iterate through lines and create HTML elements
                        lines.forEach(line => {
                            const lineDiv = document.createElement('div');
                            lineDiv.classList.add('line');
    
                            // Sort text items by x-coordinate to maintain order
                            line.sort((a, b) => a.transform[4] - b.transform[4]);
    
                            // Iterate through text items in the line
                            line.forEach(item => {
                                const textElement = document.createElement('span');
                                textElement.textContent = item.str;
    
                                // Adjust font size based on height (optional)
                                textElement.style.fontSize = `${item.height}px`;
    
                                // Adjust transformation (optional)
                                textElement.style.transform = `translate(${item.transform[4]}px, ${item.transform[5]}px)`;
    
                                // Append text element to line div
                                lineDiv.appendChild(textElement);
                            });
    
                            // Append line div to page div
                            pageDiv.appendChild(lineDiv);
                        });
    
                        // Append page div to PDF container
                        pdfContainer.appendChild(pageDiv);
                    });
                });
            }
    
            // Clear the main section and append the PDF container (after all pages are processed)
            const mainSection = document.querySelector('main');
            mainSection.innerHTML = '';
            mainSection.appendChild(pdfContainer);
        });
    }
    
    // Function to group text items by y-coordinate to simulate text lines
    function groupTextItemsByY(textItems) {
        const lines = [];
        textItems.forEach(item => {
            const y = Math.round(item.transform[5]);
            if (!lines[y]) {
                lines[y] = [];
            }
            lines[y].push(item);
        });
        return lines.filter(line => line !== undefined);
    }
    
});
