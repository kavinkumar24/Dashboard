import React, { useState, useEffect } from 'react';

function UploadImage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // State to hold the uploaded image

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    const file = event.target.files[0];

    if (file) {
      // Check if file size is less than or equal to 10KB (10 * 1024 bytes)
      if (file.size <= 10 * 1024) {
        // Proceed with the file (like setting it to state, or previewing the image)
        console.log('Image selected:', file);
      } else {
        // Display an error message
        alert('File size must be 10KB or less');
        event.target.value = null; // Clear the input
      }
  };
  }
  const handleSubmit = async () => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedImage);
    reader.onloadend = async () => {
      const imageData = new Uint8Array(reader.result);
      
      try {
        const response = await fetch("http://localhost:8081/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: Array.from(imageData) }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        console.log("Image uploaded successfully");
        fetchImage();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };
  };

  const fetchImage = async () => {
    try {
      const response = await fetch("http://localhost:8081/get-image"); 
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const data = await response.json();
      const byteArray = new Uint8Array(data.image); // Assuming the response has an `image` property
      const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Adjust type as necessary
      const imageUrl = URL.createObjectURL(blob);
      
      setUploadedImage(imageUrl); // Set the uploaded image URL
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleSubmit}>Upload Image</button>

      {uploadedImage && (
        <div>
          <h2>Uploaded Image:</h2>
          <img src={uploadedImage} alt="Uploaded" style={{ maxWidth: '300px', maxHeight: '300px' }} />
        </div>
      )}
    </div>
  );
}

export default UploadImage;




