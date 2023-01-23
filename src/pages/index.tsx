import Webcam from 'react-webcam'
import { useCallback, useRef, useState } from 'react'
import { trpc } from '../utils/trpc'
import { Rekognition } from 'aws-sdk'
import { NextPage } from 'next'
import Image from 'next/image'
import Camera from '../../public/assets/camera.svg'
import NoCamera from '../../public/assets/no-camera.svg'

const Home: NextPage = () => {
  const webcamRef = useRef<Webcam>(null)

  const [isShowVideo, setIsShowVideo] = useState(false)
  const [bestMatchImages, setBestMatchImages] = useState<string[]>([])
  const [matchResult, setMatchResult] = useState<Rekognition.FaceMatchList>()

  const indexFace = trpc.useMutation('indexFace')
  const searchFaceByImage = trpc.useMutation('searchFaceByImage')

  const onPhotoSave = useCallback(() => {
    const image = webcamRef?.current?.getScreenshot()
    if (image) {
      indexFace.mutate({ image })
    }
  }, [indexFace, webcamRef])

  const onSearch = useCallback(async () => {
    const imageSrc = webcamRef?.current?.getScreenshot()
    if (imageSrc) {
      await searchFaceByImage.mutate(
        { image: imageSrc },
        {
          onSuccess: (data: any) => {
            setMatchResult(data.matchedFaces)
            setBestMatchImages(data.images ?? [])
          },
        }
      )
    }
  }, [searchFaceByImage, webcamRef])

  const onWebcamClick = () => {
    if (isShowVideo) {
      const stream = webcamRef?.current?.stream
      const tracks = stream?.getTracks()
      tracks?.forEach((track) => track.stop())
      setIsShowVideo(false)
    } else {
      setIsShowVideo(true)
    }
  }

  return (
    <div className="bg-neutral-900 pt-10 w-screen h-screen flex flex-col items-center gap-5 text-white overflow-hidden">
      {isShowVideo && <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />}
      <div className="gap-5 flex">
        <button
          className="bg-blue-700 rounded-md w-36 py-2 flex justify-center items-center"
          onClick={onWebcamClick}
        >
          <Image
            src={isShowVideo ? Camera : NoCamera}
            alt="camera icon"
            width={25}
            height={25}
          />
        </button>
        <button
          className="bg-blue-700 rounded-md w-36 py-2"
          onClick={onPhotoSave}
        >
          Save
        </button>
        <button className="bg-blue-700 rounded-md w-36 py-2" onClick={onSearch}>
          Search
        </button>
      </div>
      <div className="flex gap-5 flex-wrap overflow-auto h-80">
        {bestMatchImages?.length > 0 &&
          bestMatchImages?.map((image, index) => (
            <div key={index} className="flex justify-center items-center mt-6">
              <div>
                <img
                  className="w-64 h-64 object-cover rounded-md"
                  src={'data:image/jpeg;base64,' + image}
                  alt="best match"
                />
              </div>
              <div className="mr-4" />
              <div>
                {matchResult && (
                  <div>
                    <div>Similarity</div>
                    <div className="text-4xl">
                      {matchResult[index]?.Similarity?.toFixed(6)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Home
