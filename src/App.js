import "./App.css";
import storage from "./data/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { useEffect, useState } from "react";
import CarCard from "./components/CarCard.js/CarCard";
import CarContent from "./components/CarContent/CarContent";

function App() {
  // State to store uploaded file
  const [file, setFile] = useState("");
  const [imageUrl, setImageUrl] = useState();
  const [carArray, setCarArray] = useState([]);

  // progress
  const [percent, setPercent] = useState(0);

  // Handle file upload event and update state
  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  const handleUpload = () => {
    if (!file) {
      alert("Please upload an image first!");
    } else {
      console.log(file);
    }

    const storageRef = ref(storage, `/files/${file.name}`);

    // progress can be paused and resumed. It also exposes progress updates.
    // Receives the storage reference and the file to upload.
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        setPercent(percent);
      },
      (err) => console.log(err),
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log(url);
          setImageUrl(url);
        });
      }
    );
  };

  const imageData = file;

  const azureComputerVisionApi = async () => {
    const response = await axios
      .post(
        `https://${process.env.REACT_APP_MRVR_ENDPOINT}/vision/v3.2/analyze?visualFeatures=Brands,Categories,Color,Objects,Tags,Description&language=en&model-version=latest`,
        imageData,
        {
          headers: {
            "Content-Type": "image/jpeg",
            "Ocp-Apim-Subscription-Key": process.env.REACT_APP_MRVR_KEY1,
          },
        }
      )
      .then((res) => {
        console.log(res);
        setCarArray(res.data);
      });
    // console.log(response.data.brands);
  };

  //   azureComputerVisionApi();

  useEffect(() => {
    azureComputerVisionApi();
  }, [imageData]);

  useEffect(() => {
    console.log(carArray);
  }, [carArray]);
  return (
    <div className="App">
      <input type="file" onChange={handleChange} accept="/image/*" />
      <button onClick={handleUpload}>Upload to Firebase</button>
      <p>{percent} % done</p>
      <img className="car-image" src={imageUrl}></img>
      {/* {carArray && <CarContent carArray={carArray} />} */}
      {carArray && JSON.stringify(carArray.brands)}
    </div>
  );
}

export default App;
