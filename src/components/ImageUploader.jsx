"use client";

import { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle } from "@components/ui/dialog"; // 👈 Asegurate que este sea tu wrapper
import { Slider } from "@radix-ui/react-slider";
import { Button } from "@components/ui/button";
import { getCroppedImg } from "@/lib/cropImage";
import { X, Scissors, ImagePlus } from "lucide-react";

export default function ImageUploader({ images, setImages }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppingIndex, setCroppingIndex] = useState(null);
    const [croppingUrl, setCroppingUrl] = useState("");
    const [openCrop, setOpenCrop] = useState(false);
    const croppedAreaPixelsRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => file);
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleDelete = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOpenCrop = (index) => {
        const file = images[index];
        const url = URL.createObjectURL(file);
        setCroppingUrl(url);
        setCroppingIndex(index);
        setOpenCrop(true);
    };

    const handleCropComplete = (_, croppedAreaPixels) => {
        croppedAreaPixelsRef.current = croppedAreaPixels;
    };

    const handleSaveCrop = async () => {
        const file = images[croppingIndex];
        const croppedImage = await getCroppedImg(croppingUrl, croppedAreaPixelsRef.current);
        setImages((prev) => {
            const updated = [...prev];
            updated[croppingIndex] = croppedImage;
            return updated;
        });
        setOpenCrop(false);
        URL.revokeObjectURL(croppingUrl);
    };

    const handleCancelCrop = () => {
        setOpenCrop(false);
        URL.revokeObjectURL(croppingUrl);
    };

    return (
        <div className="space-y-2">
            <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-dashed border-zinc-300"
            >
                <ImagePlus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </label>

            <div className="flex gap-2 flex-wrap">
                {images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 rounded overflow-hidden border">
                        <img
                            src={typeof img === "string" ? img : URL.createObjectURL(img)}
                            alt={`img-${index}`}
                            className="object-cover w-full h-full"
                        />
                        <button
                            type="button"
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-100"
                            onClick={() => handleDelete(index)}
                        >
                            <X className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                            type="button"
                            className="absolute bottom-1 right-1 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                            onClick={() => handleOpenCrop(index)}
                        >
                            <Scissors className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                ))}
            </div>

            <Dialog open={openCrop} onOpenChange={setOpenCrop}>
                <DialogContent className="p-0 max-w-lg w-full max-h-[90vh] overflow-hidden rounded-xl flex flex-col">
                    <DialogTitle className="px-4 pt-4 text-lg font-semibold">
                        Recortar imagen
                    </DialogTitle>

                    {croppingUrl && (
                        <>
                            {/* Parte scrollable */}
                            <div className="overflow-y-auto px-4 flex-1">
                                <div className="relative w-full h-[300px] bg-black mt-2">
                                    <Cropper
                                        image={croppingUrl}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={handleCropComplete}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Slider
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={[zoom]}
                                        onValueChange={(val) => setZoom(val[0])}
                                    />
                                </div>
                            </div>

                            {/* Botones fijos al fondo */}
                            <div className="p-4 border-t mt-2 bg-white">
                                <div className="flex space-x-4">
                                    <Button variant="secondary" type="button" className="flex-1" onClick={handleCancelCrop}>
                                        Cancelar
                                    </Button>
                                    <Button className="flex-1" type="button" onClick={handleSaveCrop}>
                                        Guardar recorte
                                    </Button>
                                </div>

                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
