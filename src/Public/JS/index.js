const tokenContainer = document.getElementById("token");
const token = tokenContainer == null ? "default" : tokenContainer.innerHTML;

console.log(token);

const dropZone = new Dropzone("#uploader", {
    url: "/upload",
    maxFiles: 12,
    maxFilesize: 5000,
    headers: {
        token: token
    }
});

// dropZone.