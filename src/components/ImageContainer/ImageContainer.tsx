import { useEffect, useState } from "react";
import './ImageContainer.css'

type ImageSize = {
    width: number
    height: number
}

export function ImageContainer(props: { imageUrl: string }) {
    const [imageSize, setImageSize] = useState<ImageSize>({ height: 0, width: 0 })

    function getImgSize(imgSrc: string) {
        const img = new Image();

        img.onload = () => {
            const height = img.height;
            const width = img.width;

            setImageSize({ width, height })
        }
        img.src = imgSrc; // this must be done AFTER setting onload
    }

    useEffect(() => {
        const image = document.getElementById('preview') as HTMLImageElement;
        image.onload = () => getImgSize(image.src)
    }, [])

    return (
        <div id='image_container'>
            <img id='preview' src={props.imageUrl} />
            <p>{`${imageSize.width} x ${imageSize.height}`}</p>
        </div>
    )
}