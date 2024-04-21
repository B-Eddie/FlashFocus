document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById('upload-button').addEventListener('click', handleUploadButtonClick);
    //pdfjsLib.GlobalWorkerOptions.workerSrc = '../static/pdfjs/pdf.worker.mjs';
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
            console.log(file);
            displayPDF(file);
        } else {
            console.error('No file selected');
        }
    }

    function displayPDF(file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                // Assuming only one page for simplicity
                pdf.getPage(1).then(page => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    const viewport = page.getViewport({ scale: 1 });
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    page.render({ canvasContext: context, viewport: viewport });
                    document.body.appendChild(canvas);
                });
            });
        };

        reader.readAsArrayBuffer(file);
    }
});