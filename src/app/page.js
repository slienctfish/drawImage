'use client';

import { useState } from "react";
import Image from "next/image";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt:e.target.prompt.value }),
    });

    let prediction = await response.json();
    if(response.status !== 201){
      setError(prediction.error);
      return;
    }
    setPrediction(prediction);

    while(
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ){
      await sleep(1000);
      const response = await fetch(`/api/predictions/${prediction.id}`);
      prediction = await response.json();
      if(response.status !== 200){
        setError(prediction.error);
        return;
      }
      console.log({prediction:prediction});
      setPrediction(prediction);
    }
  };
return (   
<div className="container max-w-2xl mx-auto p-5">     
  <h1 className="py-6 text-center font-bold text-2xl">       
    Dream something with{" "}       
    <a href="https://replicate.com/black-forest-labs/flux-schnell?utm_source=project&utm_project=getting-started">         
    Flux Schnell       
    </a>     
  </h1>

  <form className="w-full flex" onSubmit={handleSubmit}>       
    <input 
      type="text" 
      className="flex-grow" 
      name="prompt" 
      placeholder="Enter a prompt to display an image"
    />
    <button className="button" type="submit">
      Go!
    </button>
  </form>
    {error && <div>{error}</div>}     
    {prediction && (       
      <>         
        {prediction.output && (           
          <div className="image-wrapper mt-5">             
            <Image               
              src={prediction.output[prediction.output.length - 1]}               
              alt="output"               
              sizes="100vw"               
              height={768}               
              width={768}             
            />  
          </div>         
        )}         
        <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>       
      </>     
      )}   
</div>                
  );
}