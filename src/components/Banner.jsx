"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Banner() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const bannerImages = [
        "/banner-01.jpg?height=512&width=2560",
        "/banner-02.jpg?height=512&width=2560",
        "/banner-03.jpg?height=512&width=2560",
        "/banner-04.jpg?height=512&width=2560",
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
    };

    return (
        <div className="relative max-w-6xl mx-auto mt-14 mb-6">
            <div className="rounded-lg overflow-hidden shadow-md">
                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 z-10 shadow-md hover:bg-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-blue-600" />
                </button>

                {/* Banner Images */}
                <div className="relative h-[300px] w-full">
                    {bannerImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                                index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                        >
                            <img
                                src={image || "/placeholder.svg"}
                                alt={`Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 z-10 shadow-md hover:bg-white transition-colors"
                >
                    <ChevronRight className="w-6 h-6 text-blue-600" />
                </button>

                {/* Indicator Dots */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {bannerImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Banner;
