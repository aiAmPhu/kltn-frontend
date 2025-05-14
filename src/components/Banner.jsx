"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Banner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

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

    // Auto-rotation for slideshow
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds
        
        return () => clearInterval(timer);
    }, []);

    const location = useLocation();
    const navigate = useNavigate();
    const hasShown = useRef(false);
    
    useEffect(() => {
        if (location.state?.error && !hasShown.current) {
            hasShown.current = true; // Đánh dấu đã hiển thị thông báo
            if (location.state.error === "unauthorized") {
                toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
            } else if (location.state.error === "forbidden") {
                toast.error("Bạn không có quyền truy cập chức năng này!");
            }
            // Xóa `state` sau khi xử lý để tránh toast lại
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className="relative max-w-6xl mx-auto mt-20 mb-6">
            <div className="rounded-lg overflow-hidden shadow-lg">
                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 z-10 shadow-md hover:bg-white transition-colors"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-blue-600" />
                </button>

                {/* Banner Images Container - Set aspect ratio to match 2560:512 */}
                <div className="relative w-full" style={{ aspectRatio: '5/1' }}>
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
                                onLoad={() => index === 0 && setIsLoaded(true)}
                            />
                        </div>
                    ))}

                    {/* Loading state */}
                    {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                        </div>
                    )}
                </div>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 z-10 shadow-md hover:bg-white transition-colors"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-blue-600" />
                </button>

                {/* Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {bannerImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? "bg-blue-600 scale-110" : "bg-white/70 hover:bg-white"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Banner;