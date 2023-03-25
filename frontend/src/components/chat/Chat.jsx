import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {Client, LocalStream} from 'ion-sdk-js'
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl'
import './chat.scss'

const Chat = () => {
    const id = useParams()['id']
    const navigate = useNavigate();
    let signalRef;
    let clientRef;

    useEffect(() => {
      (async () => {
        try {
          const {data:{valid}} = await axios.get(`http://localhost:8080/validate_room_id/${id}`);
          alert('welcome new user');
        }catch(error) {
          navigate("/");
        }
      })();
    }, [])

    useEffect(() => {
      startCall();
    }, [])

    const config = {
      iceServers: [
        {urls: "stun:stun.l.google.com:19302"}
      ]
    }

    const startCall = () => {
      signalRef = new IonSFUJSONRPCSignal("ws://localhost:7000/ws");
      clientRef = new Client(signalRef, config);

      signalRef.onopen = () => clientRef.join(id);

      clientRef.ontrack = (track, stream) => {
        const outerDiv = document.createElement('div');
        outerDiv.classList.add('col-md-3', 'p-3')

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
              video.muted = true;

              console.log('adding track:', track.id)
              innerDiv.appendChild(video);
              outerDiv.appendChild(innerDiv);
              document.getElementById('videos-container').appendChild(outerDiv);

              stream.onremovetrack = (e) => {
                  console.log('about to remove:', e.track.kind);
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
      outerDiv.classList.add('col-md-3', 'p-3')

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
                video.muted = true;
                video.id = 'user-video'
                video.srcObject = media; 

                outerDiv.appendChild(innerDiv);
                innerDiv.appendChild(video);
                document.getElementById('videos-container').appendChild(outerDiv);

                clientRef.publish(media);
            }catch(error) {
                console.log('camera error:', error)
            }
            break;
        case 'screen':
          try {
              const media = await LocalStream.getUserMedia({
                  resolution: 'vga',
                  audio: true,
                  codec: 'vp8',
  
              })

              video.autolay = true;
              video.muted = true;
              video.id = 'user-video'
              video.srcObject = media; 

              innerDiv.appendChild(video);
              outerDiv.appendChild(innerDiv);
              document.getElementById('videos-container').appendChild(outerDiv);

              clientRef.publish(media);
          }catch(error) {
              console.log('camera error:', error)
          }
      }
    }
    
  return (
    <div className='container-fluid bg-dark text-light'>
      <div className="row" id='videos-container'>

        {/* <div className="col-md-3 p-3">
          <div className='bg-light rounded p-0 full'>
            <video className='full'></video>
          </div>
        </div> */}

      </div>
    </div>
  )
}

export default Chat