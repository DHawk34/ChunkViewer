import { useEffect, useState } from "react";
import './ImageContainer.css'
import { useLogger } from "@/scripts/hooks/useLoggerHook";
import { dialog, tauri } from "@tauri-apps/api";
import axios from "axios";

type ImageSize = {
    width: number
    height: number
}

export function ImageContainer(props: { imageUrl: string, loadImage(fileData: Uint8Array):void }) {
    const [imageSize, setImageSize] = useState<ImageSize>({ height: 0, width: 0 })
    const logger = useLogger()

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

    function openImage(ev: React.MouseEvent<HTMLImageElement, MouseEvent>){
        dialog.open({
            multiple: false,
            filters: [{
                name: 'png image',
                extensions: ['png']
            }]
        }).then(fileName => {
            if (typeof (fileName) === 'string') {
                const url = tauri.convertFileSrc(fileName)
    
                axios.get(url, { responseType: 'arraybuffer' }).then(response => {
                    props.loadImage(new Uint8Array(response.data));
                })
            }
        }).catch(e => logger.logError(e))
    }

    return (
        <div id='image_container'>
            <div className='drop_object'>
                <img id='preview' src={props.imageUrl} onClick={openImage} />
            </div>
            <p>{`${imageSize.width} x ${imageSize.height}`}</p>
        </div>
    )
}