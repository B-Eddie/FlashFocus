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
            xhr.open('POST', 'your-upload-endpoint-url-here');
            xhr.upload.onprogress = function(event) {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    progressBar.value = percentComplete;
                    if (percentComplete === 100) {
                        highlightifyButton.disabled = false; // Enable the button after upload
                    }
                }
            };
            xhr.onload = function() {
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
        const reader = new FileReader();
        reader.onload = function(event) {
            const typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                const container = document.createElement('div');
                container.classList.add('pdf-container');
                // Loop through each page and render it onto a canvas element
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pdf.getPage(pageNum).then(page => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        const viewport = page.getViewport({ scale: 1 });
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        page.render({ canvasContext: context, viewport: viewport });
                        container.appendChild(canvas);
                    });
                }
                // Clear the main section and append the PDF container
                const mainSection = document.querySelector('main');
                mainSection.innerHTML = '';
                mainSection.appendChild(container);
            });
        };
        reader.readAsArrayBuffer(file);
    }
});
