"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

export default function CanvasEditor({
    onChange,
}) {
    const canvasRef = useRef(null);
    const hasDrawingRef = useRef(false);

    const [isDrawing, setIsDrawing] =
        useState(false);

    const [brushColor, setBrushColor] =
        useState("#175c3d");

    const [brushSize, setBrushSize] =
        useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        context.fillStyle = "#ffffff";
        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        hasDrawingRef.current = false;
        onChange?.(null);
    }, []);

    const exportCanvasData = () => {
        const canvas = canvasRef.current;

        if (!canvas || !hasDrawingRef.current) {
            onChange?.(null);
            return;
        }

        onChange?.({
            imageData:
                canvas.toDataURL(
                    "image/png"
                ),
            width: canvas.width,
            height: canvas.height,
        });
    };

    const getPointerPosition = (
        event
    ) => {
        const canvas = canvasRef.current;
        const rectangle =
            canvas.getBoundingClientRect();

        return {
            x:
                (event.clientX -
                    rectangle.left) *
                (canvas.width /
                    rectangle.width),

            y:
                (event.clientY -
                    rectangle.top) *
                (canvas.height /
                    rectangle.height),
        };
    };

    const startDrawing = (event) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        const position =
            getPointerPosition(event);

        canvas.setPointerCapture?.(
            event.pointerId
        );

        context.strokeStyle =
            brushColor;

        context.fillStyle =
            brushColor;

        context.lineWidth =
            brushSize;

        context.lineCap = "round";
        context.lineJoin = "round";

        context.beginPath();
        context.arc(
            position.x,
            position.y,
            brushSize / 2,
            0,
            Math.PI * 2
        );
        context.fill();

        context.beginPath();
        context.moveTo(
            position.x,
            position.y
        );

        hasDrawingRef.current = true;
        setIsDrawing(true);
        exportCanvasData();
    };

    const draw = (event) => {
        if (!isDrawing) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        const position =
            getPointerPosition(event);

        context.lineTo(
            position.x,
            position.y
        );

        context.strokeStyle =
            brushColor;

        context.lineWidth =
            brushSize;

        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();

        hasDrawingRef.current = true;
        exportCanvasData();
    };

    const stopDrawing = (event) => {
        if (!isDrawing) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        context.closePath();
        setIsDrawing(false);

        canvas.releasePointerCapture?.(
            event?.pointerId
        );

        exportCanvasData();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        context.fillStyle = "#ffffff";
        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        hasDrawingRef.current = false;
        setIsDrawing(false);
        onChange?.(null);
    };

    return (
        <section className="skillora-canvas-editor">
            <div className="skillora-canvas-tools">
                <label>
                    Color

                    <input
                        type="color"
                        value={brushColor}
                        onChange={(event) =>
                            setBrushColor(
                                event.target.value
                            )
                        }
                    />
                </label>

                <label>
                    Brush size

                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={brushSize}
                        onChange={(event) =>
                            setBrushSize(
                                Number(
                                    event.target
                                        .value
                                )
                            )
                        }
                    />

                    <span>{brushSize}px</span>
                </label>

                <button
                    type="button"
                    onClick={clearCanvas}
                >
                    Clear
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={450}
                onPointerDown={
                    startDrawing
                }
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={
                    stopDrawing
                }
                onPointerLeave={
                    stopDrawing
                }
            />
        </section>
    );
}
