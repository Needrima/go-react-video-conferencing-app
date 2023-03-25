import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {Client, LocalStream} from 'ion-sdk-js'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import './chat.scss'
import { useState } from 'react'
import { useRef } from 'react'

const Chat = () => {
    const id = useParams()['id']
    const navigate = useNavigate();
    let signalRef = useRef();
    let clientRef =  useRef();

    const [deviceState, setDeviceState] = useState({
      cam: true,
      mic: true,
    })

    const {cam, mic} = deviceState;

    const toggleMicrophone = () => {
      const audio = document.getElementById('user-video').srcObject.getTrack('audio');
      if (audio.enabled) {
          audio.enabled = false;
          setDeviceState(state => ({
            ...state,
            mic: false,
          }))
      }else {
          audio.enabled = true;
          setDeviceState(state => ({
            ...state,
            mic: true,
          }))
      }
    }

    const toggleCamera = () => {
        const video = document.getElementById('user-video').srcObject.getTrack('video');
        if (video.enabled) {
            video.enabled = false;
            setDeviceState(state => ({
              ...state,
              cam: false,
            }))
        }else {
            video.enabled = true;
            setDeviceState(state => ({
              ...state,
              cam: true,
            }))
        }
    }

    useEffect(() => {
      (async () => {
        try {
          const {data:{valid}} = await axios.get(`http://localhost:8080/validate_room_id/${id}`);
          alert('welcome new user');
          startCall();
        }catch(error) {
          navigate("/");
        }
      })();
    }, [])

    const config = {
      iceServers: [
        {urls: "stun:stun.l.google.com:19302"}
      ]
    }

    const startCall = () => {
      signalRef.current = new IonSFUJSONRPCSignal("ws://localhost:7000/ws");
      clientRef.current = new Client(signalRef.current, config);

      signalRef.current.onopen = () => clientRef.current.join(id);

      clientRef.current.ontrack = (track, stream) => {
        const outerDiv = document.createElement('div');
        outerDiv.classList.add('col-md-6', 'p-3')

        const innerDiv = document.createElement('div');
        innerDiv.classList.add('rounded', 'p-0', 'full')

        const video = document.createElement('video')
        video.classList.add('full', 'rounded')
        
        if (track.kind === 'video') {
          track.onunmute = () => { // if there is a track
              outerDiv.id = track.id;

              video.srcObject = stream;
              video.autoplay = true;
              video.controls = false;

              innerDiv.appendChild(video);
              outerDiv.appendChild(innerDiv);
              document.getElementById('videos-container').appendChild(outerDiv);

              stream.onremovetrack = (e) => {
                  if (e.track.kind === 'video') {
                      const videoDivToRemove = document.getElementById(e.track.id);
                      document.getElementById('videos-container').removeChild(videoDivToRemove);
                  }
              }
          }
        }
      }

      show('camera');
    }

    const show = async (device) => {
      const outerDiv = document.createElement('div');
      outerDiv.classList.add('col-md-6', 'p-3')

      const innerDiv = document.createElement('div');
      innerDiv.classList.add('rounded', 'p-0', 'full')

      const video = document.createElement('video')
      video.classList.add('full', 'rounded')

      switch (device) {
        case 'camera':
            try {
                const media = await LocalStream.getUserMedia({
                  resolution: 'vga',
                  audio: true,
                  codec: 'vp8',
                })

                video.autoplay = true;
                video.id = 'user-video'
                video.srcObject = media; 

                outerDiv.appendChild(innerDiv);
                innerDiv.appendChild(video);
                document.getElementById('videos-container').appendChild(outerDiv);

                clientRef.current.publish(media);
            }catch(error) {
                console.log('camera error:', error)
            }
        break;

        case 'screen':
          try {
            const media = await LocalStream.getDisplayMedia({
              resolution: 'vga',
              audio: true,
              codec: 'vp8',
            })

            video.autoplay = true;
            video.srcObject = media; 

            outerDiv.appendChild(innerDiv);
            innerDiv.appendChild(video);
            document.getElementById('videos-container').appendChild(outerDiv);

            clientRef.current.publish(media);
          }catch(error) {
            console.log('camera error:', error)
          }
      }
    }
    
  return (
    <div className='container-fluid bg-dark text-light'>
      <div className="row d-flex justify-content-center align-items-center" id='videos-container'>

        {/* <div className="col-md-6 p-3">
          <div className='bg-light rounded p-0 full'>
            <video className='full'></video>
          </div>
        </div> */}

      </div>

      <div id="media-controls" className="text-center my-3">
        {mic && <i className="bi bi-mic-fill display-4 mx-2 bg-success text-light p-3 rounded-circle" id="mic-on-icon" onClick={toggleMicrophone}></i>}
        {!mic && <i className="bi bi-mic-mute-fill display-4 mx-2 bg-danger text-light p-3 rounded-circle" id="mic-off-icon" onClick={toggleMicrophone}></i>}
        {cam && <i className="bi bi-camera-video-fill display-4 mx-2 bg-success text-light p-3 rounded-circle" id="cam-on-icon" onClick={toggleCamera}></i>}
        {!cam && <i className="bi bi-camera-video-off-fill display-4 mx-2 bg-danger text-light p-3 rounded-circle" id="cam-off-icon" onClick={toggleCamera}></i>}
        <i className="bi bi-display display-4 mx-2 bg-success text-light p-3 rounded-circle" onClick={() => show('screen')}></i>
        <a href="/"><i className="bi bi-door-open-fill display-4 mx-2 bg-danger text-light p-3 rounded-circle"></i></a>
      </div>

    </div>
  )
}

export default Chat