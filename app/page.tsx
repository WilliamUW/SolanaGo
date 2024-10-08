"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Camera,
  CameraIcon,
  Coins,
  Loader2,
  Upload,
  Wallet,
} from "lucide-react";
import Image from "next/image";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    'Return what animal specie the picture is, followed by a description of the image.\n\nOutput Format:\nAnimal: [animal specie]\nDescription: [image description]\n\nIf there is no animal, return "No Animal"\n\n',
});

export default function Home() {
  const { publicKey } = useWallet();

  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [nftData, setNftData] = useState<{ explorerUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setImage(imageDataUrl);
      setStep(2);
    }
  };

  const handleMintNFT = async () => {
    setIsLoading(true);
    try {
      const format = image?.split(";")[0].slice(5);
      const base64Image = image?.split(",")[1];
      console.log(format, base64Image);

      const result = await model.generateContent([
        "Analyze this image and tell me what animal species it is, followed by a description of the image.",
        {
          inlineData: {
            mimeType: format ?? "image/jpeg",
            data: base64Image ?? "",
          },
        },
      ]);
      console.log(result);

      const geminiResponse = await result.response;
      const text = geminiResponse.text();

      // Parse the response to extract species and description
      const lines = text.split("\n");
      let species = "Unknown";
      let description = "";

      for (const line of lines) {
        if (line.startsWith("Animal:")) {
          species = line.split(":")[1].trim();
        } else if (line.startsWith("Description:")) {
          description = line.split(":")[1].trim();
        }
      }

      console.log(species, description);

      if (
        species === "Unknown" ||
        species === "No Animal" ||
        text.includes("No Animal")
      ) {
        handleNonAnimal(description);
        return;
      }

      const mintNftResponse = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          species,
          description,
          publicKey,
        }),
      });

      if (!mintNftResponse.ok) {
        const errorData = await mintNftResponse.json();
        throw new Error(errorData.error || "Failed to mint NFT");
      }

      const data = await mintNftResponse.json();
      console.log(data);
      setNftData(data);
      setStep(3);
    } catch (error) {
      setError("Error minting NFT. Please try again. " + error);
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNonAnimal = (description?: string) => {
    setError(
      `This doesn't appear to be an animal. Please try again with an animal photo. \n\nDescription: ` +
        description
    );
    setStep(5);
  };

  const resetApp = () => {
    setStep(1);
    setImage(null);
    setNftData(null);
    setError(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md align-middle justify-center">
      <h1 className="text-3xl font-bold mb-4 text-center text-white animate-pulse">
        Solana Go!
      </h1>
      <h1 className="text-3xl font-bold mb-10 text-center text-white">
        <WalletMultiButton style={{}} />
      </h1>

      {!publicKey && (
        <Card className="bg-gradient-to-br from-purple-400 to-blue-500 border-4 border-yellow-400 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4 animate-bounce">
              Welcome to Solana Go!
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-8 relative w-64 h-64">
              <Image
                src="/logo.webp"
                alt="SolanaDex Logo"
                width={256}
                height={256}
                className="rounded-full animate-spin-slow"
              />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <CameraIcon className="w-32 h-32 text-white animate-pulse" />
              </div>
            </div>
            <div className="space-y-6 w-full">
              <div
                className="flex items-center space-x-4 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <Wallet className="w-8 h-8 text-yellow-300" />
                <p className="text-white text-lg">
                  1. Connect your Solana Wallet
                </p>
              </div>
              <div
                className="flex items-center space-x-4 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Camera className="w-8 h-8 text-green-300" />
                <p className="text-white text-lg">
                  2. Take a picture of an animal
                </p>
              </div>
              <div
                className="flex items-center space-x-4 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <Coins className="w-8 h-8 text-blue-300" />
                <p className="text-white text-lg">
                  3. Mint a Solana NFT to support wildlife tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {publicKey && step === 1 && (
        <Card className="bg-yellow-100 border-4 border-yellow-400 rounded-xl shadow-lg animate-bounce">
          <CardHeader className="text-center text-xl font-bold text-blue-600">
            Capture an Animal
          </CardHeader>
          <CardContent>
            {image && (
              <div className="mt-4">
                <img
                  src={image}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-lg"
                />
              </div>
            )}
            {!image && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <Button
              onClick={handleCapture}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Camera className="mr-2 h-6 w-6" /> Capture
            </Button>
            <Button
              className="w-full mt-4"
              onClick={() => fileInputRef?.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && image && (
        <Card className="bg-green-100 border-4 border-green-400 rounded-xl shadow-lg animate-fade-in">
          <CardHeader className="text-center text-xl font-bold text-purple-600">
            Confirm Animal Photo
          </CardHeader>
          <CardContent>
            <Image
              src={image}
              alt="Captured"
              width={300}
              height={300}
              className="mb-4 max-w-full h-auto object-cover rounded-lg"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleMintNFT}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  "Mint NFT"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && nftData && (
        <Card className="bg-purple-100 border-4 border-purple-400 rounded-xl shadow-lg animate-fade-in">
          <CardHeader className="text-center text-xl font-bold text-green-600">
            NFT Minted Successfully!
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center">
              Minted NFT Data:{" "}
              <a
                href={nftData.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {JSON.stringify(nftData)}
              </a>
            </p>
            <Button
              onClick={resetApp}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Capture Another
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 5 && error && (
        <Alert variant="default" className="animate-shake">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            onClick={resetApp}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </Button>
        </Alert>
      )}
    </div>
  );
}
